/*
 *  big.js v6.2.1
 *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 *  Copyright (c) 2022 Michael Mclaughlin
 *  https://github.com/MikeMcl/big.js/LICENCE.md
 */

  var Big,


/************************************** EDITABLE DEFAULTS *****************************************/


    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places (DP) of the results of operations involving division:
     * div and sqrt, and pow with negative exponents.
     */
    DP = 20,            // 0 to MAX_DP

    /*
     * The rounding mode (RM) used when rounding to the above decimal places.
     *
     *  0  Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
     *  1  To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
     *  2  To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
     *  3  Away from zero.                                  (ROUND_UP)
     */
    RM = 1,             // 0, 1, 2 or 3

    // The maximum value of DP and Big.DP.
    MAX_DP = 1E6,       // 0 to 1000000

    // The maximum magnitude of the exponent argument to the pow method.
    MAX_POWER = 1E6,    // 1 to 1000000

    /*
     * The negative exponent (NE) at and beneath which toString returns exponential notation.
     * (JavaScript numbers: -7)
     * -1000000 is the minimum recommended exponent value of a Big.
     */
    NE = -7,            // 0 to -1000000

    /*
     * The positive exponent (PE) at and above which toString returns exponential notation.
     * (JavaScript numbers: 21)
     * 1000000 is the maximum recommended exponent value of a Big, but this limit is not enforced.
     */
    PE = 21,            // 0 to 1000000

    /*
     * When true, an error will be thrown if a primitive number is passed to the Big constructor,
     * or if valueOf is called, or if toNumber is called on a Big which cannot be converted to a
     * primitive number without a loss of precision.
     */
    STRICT = false,     // true or false


/**************************************************************************************************/


    // Error messages.
    NAME = '[big.js] ',
    INVALID = NAME + 'Invalid ',
    INVALID_DP = INVALID + 'decimal places',
    INVALID_RM = INVALID + 'rounding mode',
    DIV_BY_ZERO = NAME + 'Division by zero',

    // The shared prototype object.
    P = {},
    UNDEFINED = void 0,
    NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;


  /*
   * Create and return a Big constructor.
   */
  function _Big_() {

    /*
     * The Big constructor and exported function.
     * Create and return a new instance of a Big number object.
     *
     * n {number|string|Big} A numeric value.
     */
    function Big(n) {
      var x = this;

      // Enable constructor usage without new.
      if (!(x instanceof Big)) return n === UNDEFINED ? _Big_() : new Big(n);

      // Duplicate.
      if (n instanceof Big) {
        x.s = n.s;
        x.e = n.e;
        x.c = n.c.slice();
      } else {
        if (typeof n !== 'string') {
          if (Big.strict === true && typeof n !== 'bigint') {
            throw TypeError(INVALID + 'value');
          }

          // Minus zero?
          n = n === 0 && 1 / n < 0 ? '-0' : String(n);
        }

        parse(x, n);
      }

      // Retain a reference to this Big constructor.
      // Shadow Big.prototype.constructor which points to Object.
      x.constructor = Big;
    }

    Big.prototype = P;
    Big.DP = DP;
    Big.RM = RM;
    Big.NE = NE;
    Big.PE = PE;
    Big.strict = STRICT;
    Big.roundDown = 0;
    Big.roundHalfUp = 1;
    Big.roundHalfEven = 2;
    Big.roundUp = 3;

    return Big;
  }


  /*
   * Parse the number or string value passed to a Big constructor.
   *
   * x {Big} A Big number instance.
   * n {number|string} A numeric value.
   */
  function parse(x, n) {
    var e, i, nl;

    if (!NUMERIC.test(n)) {
      throw Error(INVALID + 'number');
    }

    // Determine sign.
    x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

    // Decimal point?
    if ((e = n.indexOf('.')) > -1) n = n.replace('.', '');

    // Exponential form?
    if ((i = n.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +n.slice(i + 1);
      n = n.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = n.length;
    }

    nl = n.length;

    // Determine leading zeros.
    for (i = 0; i < nl && n.charAt(i) == '0';) ++i;

    if (i == nl) {

      // Zero.
      x.c = [x.e = 0];
    } else {

      // Determine trailing zeros.
      for (; nl > 0 && n.charAt(--nl) == '0';);
      x.e = e - i - 1;
      x.c = [];

      // Convert string to array of digits without leading/trailing zeros.
      for (e = 0; i <= nl;) x.c[e++] = +n.charAt(i++);
    }

    return x;
  }


  /*
   * Round Big x to a maximum of sd significant digits using rounding mode rm.
   *
   * x {Big} The Big to round.
   * sd {number} Significant digits: integer, 0 to MAX_DP inclusive.
   * rm {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   * [more] {boolean} Whether the result of division was truncated.
   */
  function round(x, sd, rm, more) {
    var xc = x.c;

    if (rm === UNDEFINED) rm = x.constructor.RM;
    if (rm !== 0 && rm !== 1 && rm !== 2 && rm !== 3) {
      throw Error(INVALID_RM);
    }

    if (sd < 1) {
      more =
        rm === 3 && (more || !!xc[0]) || sd === 0 && (
        rm === 1 && xc[0] >= 5 ||
        rm === 2 && (xc[0] > 5 || xc[0] === 5 && (more || xc[1] !== UNDEFINED))
      );

      xc.length = 1;

      if (more) {

        // 1, 0.1, 0.01, 0.001, 0.0001 etc.
        x.e = x.e - sd + 1;
        xc[0] = 1;
      } else {

        // Zero.
        xc[0] = x.e = 0;
      }
    } else if (sd < xc.length) {

      // xc[sd] is the digit after the digit that may be rounded up.
      more =
        rm === 1 && xc[sd] >= 5 ||
        rm === 2 && (xc[sd] > 5 || xc[sd] === 5 &&
          (more || xc[sd + 1] !== UNDEFINED || xc[sd - 1] & 1)) ||
        rm === 3 && (more || !!xc[0]);

      // Remove any digits after the required precision.
      xc.length = sd;

      // Round up?
      if (more) {

        // Rounding up may mean the previous digit has to be rounded up.
        for (; ++xc[--sd] > 9;) {
          xc[sd] = 0;
          if (sd === 0) {
            ++x.e;
            xc.unshift(1);
            break;
          }
        }
      }

      // Remove trailing zeros.
      for (sd = xc.length; !xc[--sd];) xc.pop();
    }

    return x;
  }


  /*
   * Return a string representing the value of Big x in normal or exponential notation.
   * Handles P.toExponential, P.toFixed, P.toJSON, P.toPrecision, P.toString and P.valueOf.
   */
  function stringify(x, doExponential, isNonzero) {
    var e = x.e,
      s = x.c.join(''),
      n = s.length;

    // Exponential notation?
    if (doExponential) {
      s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;

    // Normal notation.
    } else if (e < 0) {
      for (; ++e;) s = '0' + s;
      s = '0.' + s;
    } else if (e > 0) {
      if (++e > n) {
        for (e -= n; e--;) s += '0';
      } else if (e < n) {
        s = s.slice(0, e) + '.' + s.slice(e);
      }
    } else if (n > 1) {
      s = s.charAt(0) + '.' + s.slice(1);
    }

    return x.s < 0 && isNonzero ? '-' + s : s;
  }


  // Prototype/instance methods


  /*
   * Return a new Big whose value is the absolute value of this Big.
   */
  P.abs = function () {
    var x = new this.constructor(this);
    x.s = 1;
    return x;
  };


  /*
   * Return 1 if the value of this Big is greater than the value of Big y,
   *       -1 if the value of this Big is less than the value of Big y, or
   *        0 if they have the same value.
   */
  P.cmp = function (y) {
    var isneg,
      x = this,
      xc = x.c,
      yc = (y = new x.constructor(y)).c,
      i = x.s,
      j = y.s,
      k = x.e,
      l = y.e;

    // Either zero?
    if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;

    // Signs differ?
    if (i != j) return i;

    isneg = i < 0;

    // Compare exponents.
    if (k != l) return k > l ^ isneg ? 1 : -1;

    j = (k = xc.length) < (l = yc.length) ? k : l;

    // Compare digit by digit.
    for (i = -1; ++i < j;) {
      if (xc[i] != yc[i]) return xc[i] > yc[i] ^ isneg ? 1 : -1;
    }

    // Compare lengths.
    return k == l ? 0 : k > l ^ isneg ? 1 : -1;
  };


  /*
   * Return a new Big whose value is the value of this Big divided by the value of Big y, rounded,
   * if necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
   */
  P.div = function (y) {
    var x = this,
      Big = x.constructor,
      a = x.c,                  // dividend
      b = (y = new Big(y)).c,   // divisor
      k = x.s == y.s ? 1 : -1,
      dp = Big.DP;

    if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
      throw Error(INVALID_DP);
    }

    // Divisor is zero?
    if (!b[0]) {
      throw Error(DIV_BY_ZERO);
    }

    // Dividend is 0? Return +-0.
    if (!a[0]) {
      y.s = k;
      y.c = [y.e = 0];
      return y;
    }

    var bl, bt, n, cmp, ri,
      bz = b.slice(),
      ai = bl = b.length,
      al = a.length,
      r = a.slice(0, bl),   // remainder
      rl = r.length,
      q = y,                // quotient
      qc = q.c = [],
      qi = 0,
      p = dp + (q.e = x.e - y.e) + 1;    // precision of the result

    q.s = k;
    k = p < 0 ? 0 : p;

    // Create version of divisor with leading zero.
    bz.unshift(0);

    // Add zeros to make remainder as long as divisor.
    for (; rl++ < bl;) r.push(0);

    do {

      // n is how many times the divisor goes into current remainder.
      for (n = 0; n < 10; n++) {

        // Compare divisor and remainder.
        if (bl != (rl = r.length)) {
          cmp = bl > rl ? 1 : -1;
        } else {
          for (ri = -1, cmp = 0; ++ri < bl;) {
            if (b[ri] != r[ri]) {
              cmp = b[ri] > r[ri] ? 1 : -1;
              break;
            }
          }
        }

        // If divisor < remainder, subtract divisor from remainder.
        if (cmp < 0) {

          // Remainder can't be more than 1 digit longer than divisor.
          // Equalise lengths using divisor with extra leading zero?
          for (bt = rl == bl ? b : bz; rl;) {
            if (r[--rl] < bt[rl]) {
              ri = rl;
              for (; ri && !r[--ri];) r[ri] = 9;
              --r[ri];
              r[rl] += 10;
            }
            r[rl] -= bt[rl];
          }

          for (; !r[0];) r.shift();
        } else {
          break;
        }
      }

      // Add the digit n to the result array.
      qc[qi++] = cmp ? n : ++n;

      // Update the remainder.
      if (r[0] && cmp) r[rl] = a[ai] || 0;
      else r = [a[ai]];

    } while ((ai++ < al || r[0] !== UNDEFINED) && k--);

    // Leading zero? Do not remove if result is simply zero (qi == 1).
    if (!qc[0] && qi != 1) {

      // There can't be more than one zero.
      qc.shift();
      q.e--;
      p--;
    }

    // Round?
    if (qi > p) round(q, p, Big.RM, r[0] !== UNDEFINED);

    return q;
  };


  /*
   * Return true if the value of this Big is equal to the value of Big y, otherwise return false.
   */
  P.eq = function (y) {
    return this.cmp(y) === 0;
  };


  /*
   * Return true if the value of this Big is greater than the value of Big y, otherwise return
   * false.
   */
  P.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Big is greater than or equal to the value of Big y, otherwise
   * return false.
   */
  P.gte = function (y) {
    return this.cmp(y) > -1;
  };


  /*
   * Return true if the value of this Big is less than the value of Big y, otherwise return false.
   */
  P.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Big is less than or equal to the value of Big y, otherwise
   * return false.
   */
  P.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
   * Return a new Big whose value is the value of this Big minus the value of Big y.
   */
  P.minus = P.sub = function (y) {
    var i, j, t, xlty,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }

    var xc = x.c.slice(),
      xe = x.e,
      yc = y.c,
      ye = y.e;

    // Either zero?
    if (!xc[0] || !yc[0]) {
      if (yc[0]) {
        y.s = -b;
      } else if (xc[0]) {
        y = new Big(x);
      } else {
        y.s = 1;
      }
      return y;
    }

    // Determine which is the bigger number. Prepend zeros to equalise exponents.
    if (a = xe - ye) {

      if (xlty = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }

      t.reverse();
      for (b = a; b--;) t.push(0);
      t.reverse();
    } else {

      // Exponents equal. Check digit by digit.
      j = ((xlty = xc.length < yc.length) ? xc : yc).length;

      for (a = b = 0; b < j; b++) {
        if (xc[b] != yc[b]) {
          xlty = xc[b] < yc[b];
          break;
        }
      }
    }

    // x < y? Point xc to the array of the bigger number.
    if (xlty) {
      t = xc;
      xc = yc;
      yc = t;
      y.s = -y.s;
    }

    /*
     * Append zeros to xc if shorter. No need to add zeros to yc if shorter as subtraction only
     * needs to start at yc.length.
     */
    if ((b = (j = yc.length) - (i = xc.length)) > 0) for (; b--;) xc[i++] = 0;

    // Subtract yc from xc.
    for (b = i; j > a;) {
      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i];) xc[i] = 9;
        --xc[i];
        xc[j] += 10;
      }

      xc[j] -= yc[j];
    }

    // Remove trailing zeros.
    for (; xc[--b] === 0;) xc.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xc[0] === 0;) {
      xc.shift();
      --ye;
    }

    if (!xc[0]) {

      // n - n = +0
      y.s = 1;

      // Result must be zero.
      xc = [ye = 0];
    }

    y.c = xc;
    y.e = ye;

    return y;
  };


  /*
   * Return a new Big whose value is the value of this Big modulo the value of Big y.
   */
  P.mod = function (y) {
    var ygtx,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    if (!y.c[0]) {
      throw Error(DIV_BY_ZERO);
    }

    x.s = y.s = 1;
    ygtx = y.cmp(x) == 1;
    x.s = a;
    y.s = b;

    if (ygtx) return new Big(x);

    a = Big.DP;
    b = Big.RM;
    Big.DP = Big.RM = 0;
    x = x.div(y);
    Big.DP = a;
    Big.RM = b;

    return this.minus(x.times(y));
  };
  
  
  /*
   * Return a new Big whose value is the value of this Big negated.
   */
  P.neg = function () {
    var x = new this.constructor(this);
    x.s = -x.s;
    return x;
  };


  /*
   * Return a new Big whose value is the value of this Big plus the value of Big y.
   */
  P.plus = P.add = function (y) {
    var e, k, t,
      x = this,
      Big = x.constructor;

    y = new Big(y);

    // Signs differ?
    if (x.s != y.s) {
      y.s = -y.s;
      return x.minus(y);
    }

    var xe = x.e,
      xc = x.c,
      ye = y.e,
      yc = y.c;

    // Either zero?
    if (!xc[0] || !yc[0]) {
      if (!yc[0]) {
        if (xc[0]) {
          y = new Big(x);
        } else {
          y.s = x.s;
        }
      }
      return y;
    }

    xc = xc.slice();

    // Prepend zeros to equalise exponents.
    // Note: reverse faster than unshifts.
    if (e = xe - ye) {
      if (e > 0) {
        ye = xe;
        t = yc;
      } else {
        e = -e;
        t = xc;
      }

      t.reverse();
      for (; e--;) t.push(0);
      t.reverse();
    }

    // Point xc to the longer array.
    if (xc.length - yc.length < 0) {
      t = yc;
      yc = xc;
      xc = t;
    }

    e = yc.length;

    // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
    for (k = 0; e; xc[e] %= 10) k = (xc[--e] = xc[e] + yc[e] + k) / 10 | 0;

    // No need to check for zero, as +x + +y != 0 && -x + -y != 0

    if (k) {
      xc.unshift(k);
      ++ye;
    }

    // Remove trailing zeros.
    for (e = xc.length; xc[--e] === 0;) xc.pop();

    y.c = xc;
    y.e = ye;

    return y;
  };


  /*
   * Return a Big whose value is the value of this Big raised to the power n.
   * If n is negative, round to a maximum of Big.DP decimal places using rounding
   * mode Big.RM.
   *
   * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
   */
  P.pow = function (n) {
    var x = this,
      one = new x.constructor('1'),
      y = one,
      isneg = n < 0;

    if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
      throw Error(INVALID + 'exponent');
    }

    if (isneg) n = -n;

    for (;;) {
      if (n & 1) y = y.times(x);
      n >>= 1;
      if (!n) break;
      x = x.times(x);
    }

    return isneg ? one.div(y) : y;
  };


  /*
   * Return a new Big whose value is the value of this Big rounded to a maximum precision of sd
   * significant digits using rounding mode rm, or Big.RM if rm is not specified.
   *
   * sd {number} Significant digits: integer, 1 to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   */
  P.prec = function (sd, rm) {
    if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
      throw Error(INVALID + 'precision');
    }
    return round(new this.constructor(this), sd, rm);
  };


  /*
   * Return a new Big whose value is the value of this Big rounded to a maximum of dp decimal places
   * using rounding mode rm, or Big.RM if rm is not specified.
   * If dp is negative, round to an integer which is a multiple of 10**-dp.
   * If dp is not specified, round to 0 decimal places.
   *
   * dp? {number} Integer, -MAX_DP to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   */
  P.round = function (dp, rm) {
    if (dp === UNDEFINED) dp = 0;
    else if (dp !== ~~dp || dp < -MAX_DP || dp > MAX_DP) {
      throw Error(INVALID_DP);
    }
    return round(new this.constructor(this), dp + this.e + 1, rm);
  };


  /*
   * Return a new Big whose value is the square root of the value of this Big, rounded, if
   * necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
   */
  P.sqrt = function () {
    var r, c, t,
      x = this,
      Big = x.constructor,
      s = x.s,
      e = x.e,
      half = new Big('0.5');

    // Zero?
    if (!x.c[0]) return new Big(x);

    // Negative?
    if (s < 0) {
      throw Error(NAME + 'No square root');
    }

    // Estimate.
    s = Math.sqrt(x + '');

    // Math.sqrt underflow/overflow?
    // Re-estimate: pass x coefficient to Math.sqrt as integer, then adjust the result exponent.
    if (s === 0 || s === 1 / 0) {
      c = x.c.join('');
      if (!(c.length + e & 1)) c += '0';
      s = Math.sqrt(c);
      e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
      r = new Big((s == 1 / 0 ? '5e' : (s = s.toExponential()).slice(0, s.indexOf('e') + 1)) + e);
    } else {
      r = new Big(s + '');
    }

    e = r.e + (Big.DP += 4);

    // Newton-Raphson iteration.
    do {
      t = r;
      r = half.times(t.plus(x.div(t)));
    } while (t.c.slice(0, e).join('') !== r.c.slice(0, e).join(''));

    return round(r, (Big.DP -= 4) + r.e + 1, Big.RM);
  };


  /*
   * Return a new Big whose value is the value of this Big times the value of Big y.
   */
  P.times = P.mul = function (y) {
    var c,
      x = this,
      Big = x.constructor,
      xc = x.c,
      yc = (y = new Big(y)).c,
      a = xc.length,
      b = yc.length,
      i = x.e,
      j = y.e;

    // Determine sign of result.
    y.s = x.s == y.s ? 1 : -1;

    // Return signed 0 if either 0.
    if (!xc[0] || !yc[0]) {
      y.c = [y.e = 0];
      return y;
    }

    // Initialise exponent of result as x.e + y.e.
    y.e = i + j;

    // If array xc has fewer digits than yc, swap xc and yc, and lengths.
    if (a < b) {
      c = xc;
      xc = yc;
      yc = c;
      j = a;
      a = b;
      b = j;
    }

    // Initialise coefficient array of result with zeros.
    for (c = new Array(j = a + b); j--;) c[j] = 0;

    // Multiply.

    // i is initially xc.length.
    for (i = b; i--;) {
      b = 0;

      // a is yc.length.
      for (j = a + i; j > i;) {

        // Current sum of products at this digit position, plus carry.
        b = c[j] + yc[i] * xc[j - i - 1] + b;
        c[j--] = b % 10;

        // carry
        b = b / 10 | 0;
      }

      c[j] = b;
    }

    // Increment result exponent if there is a final carry, otherwise remove leading zero.
    if (b) ++y.e;
    else c.shift();

    // Remove trailing zeros.
    for (i = c.length; !c[--i];) c.pop();
    y.c = c;

    return y;
  };


  /*
   * Return a string representing the value of this Big in exponential notation rounded to dp fixed
   * decimal places using rounding mode rm, or Big.RM if rm is not specified.
   *
   * dp? {number} Decimal places: integer, 0 to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   */
  P.toExponential = function (dp, rm) {
    var x = this,
      n = x.c[0];

    if (dp !== UNDEFINED) {
      if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
        throw Error(INVALID_DP);
      }
      x = round(new x.constructor(x), ++dp, rm);
      for (; x.c.length < dp;) x.c.push(0);
    }

    return stringify(x, true, !!n);
  };


  /*
   * Return a string representing the value of this Big in normal notation rounded to dp fixed
   * decimal places using rounding mode rm, or Big.RM if rm is not specified.
   *
   * dp? {number} Decimal places: integer, 0 to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   */
  P.toFixed = function (dp, rm) {
    var x = this,
      n = x.c[0];

    if (dp !== UNDEFINED) {
      if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
        throw Error(INVALID_DP);
      }
      x = round(new x.constructor(x), dp + x.e + 1, rm);

      // x.e may have changed if the value is rounded up.
      for (dp = dp + x.e + 1; x.c.length < dp;) x.c.push(0);
    }

    return stringify(x, false, !!n);
  };


  /*
   * Return a string representing the value of this Big.
   * Return exponential notation if this Big has a positive exponent equal to or greater than
   * Big.PE, or a negative exponent equal to or less than Big.NE.
   * Omit the sign for negative zero.
   */
  P.toJSON = P.toString = function () {
    var x = this,
      Big = x.constructor;
    return stringify(x, x.e <= Big.NE || x.e >= Big.PE, !!x.c[0]);
  };


  /*
   * Return the value of this Big as a primitve number.
   */
  P.toNumber = function () {
    var n = Number(stringify(this, true, true));
    if (this.constructor.strict === true && !this.eq(n.toString())) {
      throw Error(NAME + 'Imprecise conversion');
    }
    return n;
  };


  /*
   * Return a string representing the value of this Big rounded to sd significant digits using
   * rounding mode rm, or Big.RM if rm is not specified.
   * Use exponential notation if sd is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * sd {number} Significant digits: integer, 1 to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   */
  P.toPrecision = function (sd, rm) {
    var x = this,
      Big = x.constructor,
      n = x.c[0];

    if (sd !== UNDEFINED) {
      if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
        throw Error(INVALID + 'precision');
      }
      x = round(new Big(x), sd, rm);
      for (; x.c.length < sd;) x.c.push(0);
    }

    return stringify(x, sd <= x.e || x.e <= Big.NE || x.e >= Big.PE, !!n);
  };


  /*
   * Return a string representing the value of this Big.
   * Return exponential notation if this Big has a positive exponent equal to or greater than
   * Big.PE, or a negative exponent equal to or less than Big.NE.
   * Include the sign for negative zero.
   */
  P.valueOf = function () {
    var x = this,
      Big = x.constructor;
    if (Big.strict === true) {
      throw Error(NAME + 'valueOf disallowed');
    }
    return stringify(x, x.e <= Big.NE || x.e >= Big.PE, true);
  };


  // Export


  Big = _Big_();

  Big['default'] = Big.Big = Big;

  //AMD.
  if (typeof define === 'function' && define.amd) {
    define(function () { return Big; });

  // Node and other CommonJS-like environments that support module.exports.
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = Big;

  //Browser.
  }

;var NK = {};

NK.isset = function( variable ) {
    if ( typeof variable === 'undefined' ) return false;
    if ( variable == null ) return false;
    if ( typeof variable === 'function' ) {
        try {
            variable();
        } catch (e) {
            return false;
        }
    }

    return true;
};

NK.empty = function( variable ) {
    if ( !NK.isset(variable) ) return true;
    return ( typeof variable === 'function' ) ? variable().length === 0 : variable.length === 0;
};

NK.var = function( variable, default_value ) {
    return NK.isset( variable ) ? variable : default_value;
}

NK.clone = function ( obj ) {
    console.error("NK.clone() deprecated, use NKObject.clone() instead.");
    return JSON.parse(JSON.stringify(obj));
};

NK.backtrace = function ( msg = "" ) {
    let backtrace = new Error().stack.split("\n").slice(2).join("\n");
    console.log("Backtrace: " + msg + "\n" + backtrace);
};

NK.getScriptPath = function () {
    let scripts = document.querySelectorAll("script"); //Los otros tag aun no están parseados
    let script_src = scripts[scripts.length - 1].src;
    return script_src.substring(8, script_src.lastIndexOf("/"));
};

//Avoid sync = true
NK.sleep = function ( ms, sync = false ) {
    if ( !sync ) return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

    let  inicio = new Date().getTime();

    while ( new Date().getTime() - inicio < ms ) {
        // DO NOT USE! ONLY FOR TESTING PURPOSES!
    }
};

function NKEventListener() {
    this.events = {};

    this.addEventListener = function ( name, func ) {
        if ( !NK.isset(this.events[name]) ) this.events[name] = [];

        this.events[name].push( func );
    }

    this.removeEventListener = function ( name, func ) {
        for ( var i = 0; i < this.events[name].length; i++ ) {
            var ev = this.events[name][i];

            if ( ev === func ) {
                this.events[name].splice(i, 1);
                break;
            }
        }
    }

    this.dispatchEvent = function ( name, data ) {
        if ( !NK.isset(this.events[name]) ) return;

        for ( var i = 0; i < this.events[name].length; i++ ) {
            var ev = this.events[name][i];
            ev( data );
        }

    }
}



NK.core = {};

NK.core.reloadOnDomChange = function( module ) {
    
    if ( !NK.isset(NK.core.reactableModules) ) NK.core.reactableModules = [];

    NK.core.reactableModules.push( module );

    if ( !NK.isset( NK.core.MutationObserver ) ) {
        //http://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener

        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        NK.core.MutationObserverOffset = 1;

        NK.core.MutationObserver = new MutationObserver(function(mutations, observer) {
            if ( NK.core.MutationObserverOffset > 0 ) {
                NK.core.MutationObserverOffset--;
                return;
            }

            for( var i = 0; i < NK.core.reactableModules.length; i++ ) {
                if ( typeof NK.core.reactableModules[i].reload !== 'undefined' ) {
                    NK.core.reactableModules[i].reload();
                }
            }

        });

        NK.core.MutationObserver.observe( document, {subtree: true, childList: true} );

    }

};

NK.core.ignoreMutations = function( numMutations ) {
    if ( NK.isset(NK.core.MutationObserver) ) NK.core.MutationObserverOffset += numMutations;
};


window.addEventListener("load", function () {
    if ( !NK.isset(() => window.$) ) {
        throw "Error, you must include jquery before using NKLibsJS";
    }
    window.loaded = true;
});

/*
NK.autoload = function( modules ) {

    for( var i = 0; i < modules.length; i++ ) {
        if ( typeof modules[i].start !== 'undefined' ) {
            modules[i].start();
        }
    }
};
*/


// https://mikemcl.github.io/big.js/

Number.prototype.nksum = function(value) {
    return new Big(this).add(value).toNumber();
};
Number.prototype.nkadd = function(value) {
    return new Big(this).add(value).toNumber();
};
Number.prototype.nkminus = function(value) {
    return new Big(this).minus(value).toNumber();
};
Number.prototype.nksubtract = function(value) {
    return new Big(this).minus(value).toNumber();
};
Number.prototype.nkdiv = function(value) {
    return new Big(this).div(value).toNumber();
};
Number.prototype.nkmul = function(value) {
    return new Big(this).mul(value).toNumber();
};
Number.prototype.nkpow = function(value) {
    return new Big(this).pow(value).toNumber();
};
Number.prototype.nkmod = function(value) {
    return new Big(this).mod(value).toNumber();
};
Number.prototype.nkprec = function(value) {
    return new Big(this).prec(value).toNumber();
};
Number.prototype.nkround = function(value) {
    return new Big(this).round(value).toNumber();
};
Number.prototype.nksqrt = function() {
    return new Big(this).sqrt().toNumber();
};
Number.prototype.nkabs = function() {
    return Math.abs(this);
};


;var NKActions = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before actions.js";
}


NKActions.start = function( reactable ) {
    if ( NK.isset(NKActions.loaded) && NKActions.loaded === true ) return;

    window.addEventListener('load', NKActions.reload );
    if ( window.loaded === true ) NKActions.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKActions );
    }
    
    NKActions.loaded = true;
};


NKActions.reload = function() {

    $('.NKHide_btn').off().on('click', function(){
        $(this).closest('.NKHide_dst').hide();
    });

    $('.NKDel_btn').off().on('click', function(){
        $(this).closest('.NKDel_dst').remove();
    });

    function reactLabel( orig, dst ) {
        var labelName = $(orig).html();
        if ( labelName.toLowerCase().startsWith("hide") || labelName.toLowerCase().startsWith("show") ) {
            labelName = labelName.substring(4);
        }
        if ( labelName.length > 0 && !labelName.startsWith(" ") ) labelName = " " + labelName;

        if ( dst.is(':visible') ) {
            $(orig).html("Hide" + labelName);
        } else {
            $(orig).html("Show" + labelName);
        }
        console.log("entra");
    }

    $('.NKToggle_btn').off().on('click', function(){
        var e = $(this).siblings('.NKToggle_dst');
        e.toggle();
        if ( $(this).hasClass('NKReact') ) reactLabel(this, e);
    });

    $('.NKToggle_btn.NKReact').each(function() {
        var e = $(this).siblings('.NKToggle_dst');
        reactLabel(this, e);
    });

};


;let NKArray = {};

NKArray.clone = function ( obj ) {
    return JSON.parse(JSON.stringify(obj));
}

// Arguments: Multiple arrays, get all possible combinations
NKArray.getCombinations = function(){
    if ( typeof arguments[0] !== "string" ) {
        console.error("First argument must be a string.");
        return [];
    }

    let join_str = arguments[0];
    let array_of_arrays = [];

    for ( let i = 1; i < arguments.length; i++ ) {
        if( !Array.isArray(arguments[i]) ) {
            console.error("One of the parameters is not an array.");
            return [];
        }
        array_of_arrays.push( arguments[i] );
    }


    function formCombination( odometer, array_of_arrays ){
        return odometer.reduce(
            function(accumulator, odometer_value, odometer_index){
                return "" + accumulator + array_of_arrays[odometer_index][odometer_value] + join_str;
            },
            ""
        );
    }

    function odometer_increment( odometer, array_of_arrays ){

        for ( let i_odometer_digit = odometer.length-1; i_odometer_digit >= 0; i_odometer_digit-- ){

            let maxee = array_of_arrays[i_odometer_digit].length - 1;

            if( odometer[i_odometer_digit] + 1 <= maxee ){
                odometer[i_odometer_digit]++;
                return true;
            }
            if ( i_odometer_digit - 1 < 0 ) return false;
            odometer[i_odometer_digit] = 0;

        }

    }


    let odometer = new Array( array_of_arrays.length ).fill( 0 );
    let output = [];

    let newCombination = formCombination( odometer, array_of_arrays );

    output.push( newCombination.slice(0, -1) );

    while ( odometer_increment( odometer, array_of_arrays ) ){
        newCombination = formCombination( odometer, array_of_arrays );
        output.push( newCombination.slice(0, -1) );
    }

    return output;
};


NKArray.mountTree = function ( data, id_name, parent_id_name, child_arr_name ) {
    let refs = {};
    let result = [];

    for (let i = 0; i < data.length; i++ ) {
        if ( typeof refs[data[i][id_name]] === 'undefined' ) {
            refs[data[i][id_name]] = {};
            refs[data[i][id_name]][child_arr_name] = [];
        }
        if ( typeof refs[data[i][parent_id_name]] === 'undefined' ) {
            refs[data[i][parent_id_name]] = {};
            refs[data[i][parent_id_name]][child_arr_name] = [];
        }
        refs[data[i][id_name]] = {...data[i], ...refs[data[i][id_name]]};

        if ( parseInt(data[i][parent_id_name]) === 0 ) {
            result.push(refs[data[i][id_name]]);
        } else {
            refs[data[i][parent_id_name]][child_arr_name].push(refs[data[i][id_name]]);
        }
    }

    return result;
};
;
function NKCanvas( canvas_element_or_id = null ) {
    this.canvas = null;
    this.ctx = null;
    this.w = 0;
    this.h = 0;

    if ( canvas_element_or_id === null ) {
        this.canvas = document.createElement('canvas');

    } else if ( canvas_element_or_id instanceof HTMLCanvasElement ) {
        this.canvas = canvas_element_or_id;

    } else if ( typeof canvas_element_or_id === "string" ) {
        this.canvas = document.getElementById( canvas_element_or_id );

    } else {
        console.error("NKCanvas invalid argument.");
        return;
    }

    this.canvas.style.imageRendering = 'pixelated'; //Important!

    this.ctx = this.canvas.getContext('2d');
    //this.ctx.imageSmoothingEnabled = false;

    this.w = this.canvas.width;
    this.h = this.canvas.height;

}

NKCanvas.prototype.setSize = function ( w = 400, h = 200 ) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.w = w;
    this.h = h;
}

NKCanvas.prototype.clean = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

NKCanvas.prototype.getPixelColor = function ( x = 0, y = 0 ) {

    let data = this.ctx.getImageData(0, 0, this.w, this.h, {willReadFrequently: true}).data;

    let pixel = (this.w).nkmul(y).nksum(x);
    let position = pixel.nkmul(4);

    return {
        rgba: [data[position], data[position + 1], data[position + 2], data[position + 3]]
    };
}

NKCanvas.prototype.searchPixelCoords = function ( rgba_color = [0, 0, 0] ) {

    let data = this.ctx.getImageData(0, 0, this.w, this.h).data;

    let pos_i = -1;
    for ( let i = 0; i < data.length; i = i+4 ) {
        if ( data[i] === rgba_color[0] && data[i+1] === rgba_color[1] && data[i+2] === rgba_color[2] ) {
            pos_i = i;
            break;
        }
    }

    let pixel_i = pos_i.nkdiv(4);
    let row = Math.floor( pixel_i.nkdiv(this.w) );
    let col = pixel_i % this.w;

    return {x: col, y: row};

}

NKCanvas.prototype.extractPortion = function ( x, y, w, h, ctx_options = {}  ) {
    let aux_canvas = document.createElement("canvas");
    let aux_ctx = aux_canvas.getContext("2d", ctx_options);

    aux_canvas.hidden = true;
    aux_canvas.width = w;
    aux_canvas.height = h;
    aux_ctx.drawImage(this.canvas, x, y, w, h, 0, 0, w, h);

    return aux_canvas;
}

NKCanvas.prototype.replaceColor = function ( old_color, new_color ) {
    let image_data = this.ctx.getImageData(0, 0, this.w, this.h);
    let data = image_data.data;
    let replace_times = 0;

    if ( old_color.length === 4 && new_color.length === 4 ) {
        for (let i = 0; i < data.length; i += 4) {
            if ( data[i] === old_color[0] && data[i+1] === old_color[1] && data[i+2] === old_color[2] && data[i+3] === old_color[3] ) {
                data[i] = new_color[0];
                data[i+1] = new_color[1];
                data[i+2] = new_color[2];
                data[i+3] = new_color[3];
                replace_times++;
            }
        }
    } else {
        for (let i = 0; i < data.length; i += 4) {
            if ( data[i] === old_color[0] && data[i+1] === old_color[1] && data[i+2] === old_color[2] ) {
                data[i] = new_color[0];
                data[i+1] = new_color[1];
                data[i+2] = new_color[2];
                replace_times++;
            }
        }
    }

    this.ctx.putImageData(image_data, 0, 0);
    return replace_times;
}


NKCanvas.prototype.compare = function ( canvas_2_element ) {
    const ctx1 = this.ctx;
    const ctx2 = canvas_2_element.getContext("2d");

    function comparePixels(pixel1, pixel2) {
        return (
            pixel1[0] === pixel2[0] &&
            pixel1[1] === pixel2[1] &&
            pixel1[2] === pixel2[2] &&
            pixel1[3] === pixel2[3]
        );
    }

    if (this.h !== canvas_2_element.width || this.h !== canvas_2_element.height) {
        return console.error("Los canvas tienen dimensiones diferentes.");
    }

    const imageData1 = ctx1.getImageData(0, 0, this.w, this.h);
    const imageData2 = ctx2.getImageData(0, 0, this.w, this.h);

    const data1 = imageData1.data;
    const data2 = imageData2.data;

    let differences = [];
    for (let i = 0; i < data1.length; i += 4) {
        const pixel1 = data1.slice(i, i + 4);
        const pixel2 = data2.slice(i, i + 4);

        if (!comparePixels(pixel1, pixel2)) {
            const x = (i / 4) % this.w;
            const y = Math.floor(i / 4 / this.w);
            differences.push({x: x, y: y, color_1: pixel1, color_2: pixel2});
        }
    }

    return differences;
}

NKCanvas.prototype.drawRect = function ( args ) {
    let border = NK.var(args.border_px, 0);
    let x = NK.var(args.x, 0);
    let y = NK.var(args.y, 0);
    let w = NK.var(args.w, 0);
    let h = NK.var(args.h, 0);

    if ( args.x && args.x2 ) w = (args.x2).nkminus(args.x).nksum(border*2);
    if ( args.y && args.y2 ) h = (args.y2).nkminus(args.y).nksum(border*2);


    if ( NK.isset(args.color) ) this.ctx.fillStyle = args.color;
    if ( NK.isset(args.border_px) ) this.ctx.lineWidth = args.border_px;
    if ( NK.isset(args.border_color) ) this.ctx.strokeStyle = args.border_color;
    if ( NK.isset(args.border_pattern) ) this.ctx.setLineDash(args.border_pattern); //array(2): [longitud del segmento, espacio]

    if ( NK.isset(args.color) ) this.ctx.fillRect(x+border, y+border, w, h);
    if ( NK.isset(args.border_color) || (NK.isset(args.border_px) && args.border_px > 0) ) this.ctx.strokeRect( x+border, y+border, w, h );

}

NKCanvas.prototype.drawCircle = function ( args ) {

    let r = NK.var( args.r, NK.var(args.d, 10).nkdiv(2) );
    let x = NK.var( (args.x).nksum(r), 0 ).nkminus( args.r );
    let y = NK.var( (args.y).nksum(r), 0 ).nkminus( args.r );


    this.ctx.beginPath();

    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    if ( NK.isset(args.color) ) this.ctx.fillStyle = args.color;
    if ( NK.isset(args.color) ) this.ctx.fill();

    if ( NK.isset(args.border_px) ) this.ctx.lineWidth = args.border_px;
    if ( NK.isset(args.border_color) ) this.ctx.strokeStyle = args.border_color;
    if ( NK.isset(args.border_color) || NK.isset(args.border_px) ) this.ctx.stroke();

}

NKCanvas.prototype.drawLine = function ( args ) {

    if ( NK.isset(args.color) ) this.ctx.strokeStyle = args.color;
    if ( NK.isset(args.w) ) this.ctx.lineWidth = args.w;
    if ( NK.isset(args.pattern) ) this.ctx.setLineDash(args.pattern); //array(2): [longitud del segmento, espacio]

    this.ctx.beginPath();
    this.ctx.moveTo(args.x, args.y);
    this.ctx.lineTo(NK.var(args.x2, args.x), NK.var(args.y2, args.y));
    this.ctx.stroke();


}

NKCanvas.prototype.drawText = function ( args ) {
    let font_size = NK.var( args.font_size, 12 );
    if ( !isNaN(font_size) ) font_size = font_size + "px";

    let font_weight = NK.var( args.font_weight, "normal" ); //bold
    let font_family = NK.var( args.font_family, "Arial" );
    let font_color = NK.var( args.font_color, "black" );

    this.ctx.font = font_weight + " " + font_size + " " + font_family; //'bold 20px Arial'
    this.ctx.fillStyle = font_color;
    this.ctx.textBaseline = 'top'; //Top left
    this.ctx.fillText(NK.var(args.text, "Text"), NK.var(args.x, 0), NK.var(args.y, 0));
}
;var NKCast = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before cast.js";
}

NKCast.intByteArray = {
    // [65, 66] => "AB" (Utf 8 or 16)
    toUtf8String: function( data ) {
        var result = '';
        for ( var i = 0; i < data.length; i++ ) {
            if ( data[i] < 0 || data[i] > 255 ) {
                console.error("Error NKCast.intByteArray.toUtf8String(): ("+data[i]+") Out of range [0..255]");
            }
            result += String.fromCharCode( data[i] );
        }
        return result;
    },

    toUtf16String: function( data ) {
        // The input is 8 bit.
        return NKCast.intByteArray.toUtf8String( data );
    },
    
    // [65, 66] => "0x41 0x42" | "41 42" | "4142" ...
    toHexString: function( data, startWith0x, addSpaces ) {
        if ( !NK.isset(data) ) return '';
        var result = '';
        for ( var i = 0; i < data.length; i++ ) {
            if ( addSpaces && i != 0 ) result += ' ';
            result += NKCast.intByte.toHexString( data[i], startWith0x );
        }
        return result;
    },

    toInt: function ( data ) {
        var result = 0, mult = 1;
        for ( var i = data.length-1; i >= 0; i-- ) {
            if ( data[i] < 0 || data[i] > 255 ) {
                console.error("Error NKCast.intByteArray.toUtf16String(): ("+data[i]+") Out of range [0..255]");
            }
            result += data[i] * mult;
            mult *= 256;
        }
        return result;
    }

};


NKCast.intByte = {
    // 255 => "ff" || "0xff"
    toHexString: function ( data, startWith0x ) {
        if ( data < 0 || data > 255 ) console.error("Error NKCast.intByte.toHexString(): ("+data+") Out of range [0..255]");
        if ( !startWith0x ) return data.toString( 16 );
        return "0x" + data.toString( 16 );
    }

};

NKCast.utf16String = {
    // "AB" => [65, 66] (Utf 8 or 16)
    toIntByteArray: function( data ) {
        var result = '';
        for ( var i = 0; i < data.length; i++ ) result += data.charCodeAt( i );
        return result;
    }
};

NKCast.utf8String = {
    // "AB" => [65, 66] (Utf 8 or 16)
    toIntByteArray: function( data ) {
        return NKCast.utf16String.toIntByteArray( data );
    }
};

;
function NKBarChart ( wrapper_id, w = 600, h = 300) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.px_per_second = -1;
    this.px_per_value = -1;
    this.w = w;
    this.h = h;
    this.data_ref = [];

    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );

}

NKBarChart.prototype.setSize = function ( w = 600, h = 300 ) {
    this.w = w;
    this.h = h;
}

NKBarChart.prototype.setScale = function ( px_per_second = 0.1, px_per_value = 0.1 ) {
    this.px_per_second = px_per_second;
    this.px_per_value = px_per_value;
}

NKBarChart.prototype.setMouseMoveCbk = function ( cbk ) {
    let self = this;

    this.drawbox.onMouseMoveCbk = function (x, y) {
        let minutes = parseInt( x.nkdiv( self.px_per_second ).nkdiv(60) );
        try {
            cbk(x, y, self.data_ref[minutes]);
        } catch (e){}

    }
}

NKBarChart.prototype.drawBars = function ( bar_array ) {
    if ( bar_array.length === 0 ) return;

    this.data_ref = bar_array;

    let min_value = Infinity;
    let max_value = 0;
    let min_timestamp = Infinity;
    let max_timestamp = 0;

    for ( let i = 0; i < bar_array.length; i++ ) {
        if ( bar_array[i].value < min_value ) min_value = bar_array[i].value;
        if ( bar_array[i].value > max_value ) max_value = bar_array[i].value;
        if ( bar_array[i].timestamp < min_timestamp ) min_timestamp = bar_array[i].timestamp;
        if ( bar_array[i].timestamp > max_timestamp ) max_timestamp = bar_array[i].timestamp;
    }

    min_timestamp = min_timestamp.nkdiv(1000); //milliseconds to seconds
    max_timestamp = max_timestamp.nkdiv(1000);

    if ( this.px_per_second === -1 ) this.px_per_second = (this.w).nkdiv( max_timestamp.nkminus(min_timestamp) );
    if ( this.px_per_value === -1 ) this.px_per_value = (this.h).nkdiv( max_value.nkminus(min_value) );

    let neg_values = (min_value < 0);

    this.h = max_value.nkminus(min_value).nkmul(this.px_per_value);
    this.w = max_timestamp.nkminus(min_timestamp).nkmul(this.px_per_second);

    this.drawbox.clean();
    this.drawbox.setSize(this.w, this.h);


    if ( neg_values ) { //Base line
        let base_line_y = (this.h).nksum(min_value.nkmul(this.px_per_value));
        this.drawbox.drawLine({
            x: 0,
            y: base_line_y,
            x2: this.w,
            y2: base_line_y,
            w: 1,
            color: "#E0E3EB"
        });
    }

    let w = (50).nkmul(this.px_per_second); //Usar 50 segundos para dibujar cada candle

    for ( let i = 0; i < bar_array.length; i++ ) {
        let bar = bar_array[i];

        let x = (bar.timestamp).nkdiv(1000).nkminus(min_timestamp).nkmul(this.px_per_second);
        let h = (bar.value).nkmul(this.px_per_value);
        let y = (this.h).nkminus( (bar.value).nkminus(min_value).nkmul(this.px_per_value) );

        this.drawbox.drawRect({
            x: x,
            y: y,
            w: w,
            h: h,
            color: bar.color,
            border_px: 0
        });

    }


};
function NKCandleChart ( wrapper_id, w = 600, h = 300 ) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.nkpixelperfect = new NKPixelPerfect();

    this.data_ref = [];

    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );

    this.nkpixelperfect.configCandles();

}

NKCandleChart.prototype.setZoom = function ( zoom_x = 1, zoom_y = 1 ) {
    this.nkpixelperfect.setCandlesZoom( zoom_x, zoom_y );
}


NKCandleChart.prototype.setMouseMoveCbk = function ( cbk = (x, y, candle_i) => {} ) {
    let self = this;
    
    this.drawbox.onMouseMoveCbk = function (x, y) {
        let gap = self.nkpixelperfect.candles.rectangle_dist - self.nkpixelperfect.candles.rectangle_w;
        let candle_i = Math.trunc( (x + (gap/2)) /self.nkpixelperfect.candles.rectangle_dist);

        cbk(x, y, candle_i);
    }
}




NKCandleChart.prototype.getCandleData = function ( candle_array ) {
    let min_price = Infinity;
    let max_price = 0;
    let min_timestamp = Infinity;
    let max_timestamp = 0;

    for ( let i = 0; i < candle_array.length; i++ ) {
        if ( candle_array[i].low < min_price ) min_price = candle_array[i].low;
        if ( candle_array[i].high > max_price ) max_price = candle_array[i].high;
        if ( candle_array[i].timestamp < min_timestamp ) min_timestamp = candle_array[i].timestamp;
        if ( candle_array[i].timestamp > max_timestamp ) max_timestamp = candle_array[i].timestamp;
    }

    min_timestamp = min_timestamp.nkdiv(1000); //milliseconds to seconds
    max_timestamp = max_timestamp.nkdiv(1000);

    return {
        min_price: min_price,
        max_price: max_price,
        min_timestamp: min_timestamp,
        max_timestamp: max_timestamp,
    };
}


NKCandleChart.prototype.drawCandles = function ( candle_array ) {
    if ( candle_array.length === 0 ) return;

    this.data_ref = candle_array;

    let cd = this.getCandleData( candle_array );

    let px_per_value = this.nkpixelperfect.calcCandlesPxPerValue( cd.min_price, cd.max_price );


    let drawbox_h = this.nkpixelperfect.candles.chart_h;
    let drawbox_w = this.nkpixelperfect.calcCandlesTotalWidth( candle_array.length );

    this.drawbox.clean();
    this.drawbox.setSize(drawbox_w, drawbox_h);



    for ( let i = 0; i < candle_array.length; i++ ) {
        let candle = candle_array[i];


        let low = (candle.low-cd.min_price) * px_per_value;
        let high =  (candle.high-cd.min_price) * px_per_value;
        let open =  (candle.open-cd.min_price) * px_per_value;
        let close =  (candle.close-cd.min_price) * px_per_value;


        //Red: #EF5350
        //Green: #26A69A
        let default_color = open < close ? "#EF5350" : "#26A69A";
        let color = candle.color ? candle.color : default_color;

        
        let candle_x = this.nkpixelperfect.candles.rectangle_dist.nkmul(i);
        let line_x = candle_x.nksum( this.nkpixelperfect.candles.rectangle_w.nkminus(1).nkdiv(2) );


        this.drawbox.drawLine({
            x: line_x,
            by: high,
            x2: line_x,
            by2: low,
            w: 1,
            color: color,
        });

        this.drawbox.drawRect({
            x: candle_x,
            by: Math.max(open, close),
            w: this.nkpixelperfect.candles.rectangle_w,
            h: open.nkminus(close).nkabs(),
            color: color,
            border_px: 0
        });



    }


};

function NKPixelPerfect() {
    this.zoom_x = 3;
    this.zoom_y = 1;
    this.candles = {
        rectangle_w: 5, //Ancho de la vela, tiene que ser IMPAR para poner la linea central.
        rectangle_dist: 8, //Ancho de la vela + ancho del espacio entre velas. Puede ser PAR O IMPAR.
        chart_h: 200,
        raw: {
            rectangle_w: 8,
            rectangle_dist: 7,
            chart_h: 200,
        }
    };
    
    if ( window.devicePixelRatio !== 1 ) {
        console.warn( "NKPixelPerfect: The browser zoom level is not set to 100%. This may affect visual rendering." );
    }

}


NKPixelPerfect.prototype.configCandles = function ( rectangle_w = 5, gap_px = 3, chart_h = 200 ) {
    this.candles.raw.rectangle_w = rectangle_w;
    this.candles.raw.rectangle_dist = rectangle_w.nksum( gap_px );
    this.candles.raw.chart_h = chart_h;
    
    if ( rectangle_w % 2 === 0 ) {
        console.error("NKPixelPerfect.configCandles: rectangle_w debe ser impar para que la linea central quede bien alineada.");
    }

    this.setCandlesZoom( this.zoom_x, this.zoom_y );
}

NKPixelPerfect.prototype.setCandlesZoom = function ( zoom_x = 1, zoom_y = 1 ) {
    this.zoom_x = parseInt(zoom_x); //Tiene que ser un valor entero.
    this.zoom_y = parseInt(zoom_y);

    let rectangle_growth = (2).nkmul( this.zoom_x - 1 ); //Cada unidad de zoom crece 2px el ancho de la vela (1px por lado).
    let chart_h_growth = (10).nkmul( this.zoom_y - 1 ); //Cada unidad de zoom crece 10px la altura del chart.

    this.candles.rectangle_w = this.candles.raw.rectangle_w.nksum(rectangle_growth);
    this.candles.rectangle_dist = this.candles.raw.rectangle_dist.nksum(rectangle_growth);
    this.candles.chart_h = this.candles.raw.chart_h.nksum(chart_h_growth);
}

NKPixelPerfect.prototype.calcCandlesTotalWidth = function ( num_candles ) {
    return this.candles.rectangle_dist.nkmul(num_candles-1).nksum( this.candles.rectangle_w );
}

NKPixelPerfect.prototype.calcCandlesPxPerValue = function ( min_price, max_price ) {
    return this.candles.chart_h.nkdiv( max_price.nkminus(min_price) );
}

NKPixelPerfect.prototype.calcCandlePos = function ( min_price, max_price, current_price ) {
    let px_per_value = this.candles.chart_h.nkdiv( max_price.nkminus(min_price) );
    return current_price.nkminus(min_price).nkmul(px_per_value);
}


NKPixelPerfect.prototype.configBars = function ( x_gap_px ) {
    //this.x_gap_px = x_gap_px;
};
function NKPointChart ( wrapper_id, connect_points = true, w = 600, h = 300) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.connect_points = connect_points;
    this.px_per_second = -1;
    this.px_per_value = -1;
    this.w = w;
    this.h = h;
    this.data_ref = [];


    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );

}

NKPointChart.prototype.setSize = function ( w = 600, h = 300 ) {
    this.w = w;
    this.h = h;
}

NKPointChart.prototype.setScale = function ( px_per_second = 0.1, px_per_value = 0.1 ) {
    this.px_per_second = px_per_second;
    this.px_per_value = px_per_value;
}

NKPointChart.prototype.setMouseMoveCbk = function ( cbk ) {
    let self = this;

    this.drawbox.onMouseMoveCbk = function (x, y) {
        let minutes = parseInt( x.nkdiv( self.px_per_second ).nkdiv(60) );
        try {
            cbk(x, y, self.data_ref[minutes]);
        } catch (e){}

    }
}

NKPointChart.prototype.drawPoints = function ( point_array ) {
    if ( point_array.length === 0 ) return;

    this.data_ref = point_array;

    let min_value = Infinity;
    let max_value = 0;
    let min_timestamp = Infinity;
    let max_timestamp = 0;

    for ( let i = 0; i < point_array.length; i++ ) {
        if ( point_array[i].value < min_value ) min_value = point_array[i].value;
        if ( point_array[i].value > max_value ) max_value = point_array[i].value;
        if ( point_array[i].timestamp < min_timestamp ) min_timestamp = point_array[i].timestamp;
        if ( point_array[i].timestamp > max_timestamp ) max_timestamp = point_array[i].timestamp;
    }

    min_timestamp = min_timestamp.nkdiv(1000); //milliseconds to seconds
    max_timestamp = max_timestamp.nkdiv(1000);

    if ( this.px_per_second === -1 ) this.px_per_second = (this.w).nkdiv( max_timestamp.nkminus(min_timestamp) );
    if ( this.px_per_value === -1 ) this.px_per_value = (this.h).nkdiv( max_value.nkminus(min_value) );

    let neg_values = (min_value < 0);

    this.h = max_value.nkminus(min_value).nkmul(this.px_per_value);
    this.w = max_timestamp.nkminus(min_timestamp).nkmul(this.px_per_second);

    this.drawbox.clean();
    this.drawbox.setSize(this.w, this.h);

    if ( neg_values ) { //Base line
        let base_line_y = (this.h).nksum( min_value.nkmul(this.px_per_value) );
        this.drawbox.drawLine({
            x: 0,
            y: base_line_y,
            x2: this.w,
            y2: base_line_y,
            w: 1,
            color: "#E0E3EB"
        });
    }

    let last_x = null;
    let last_y = null;

    for ( let i = 0; i < point_array.length; i++ ) {
        let point = point_array[i];

        let x = (point.timestamp).nkdiv(1000).nkminus(min_timestamp).nkmul(this.px_per_second);
        let y = (this.h).nkminus( (point.value).nkminus(min_value).nkmul(this.px_per_value) );

        if ( (this.connect_points || point.connect_prev === true)  && point.connect_prev !== false && last_x !== null ) {
            this.drawbox.drawLine({
                x: last_x,
                y: last_y,
                x2: x,
                y2: y,
                w: 1,
                color: "blue",
                style: "solid"
            });
        }

        this.drawbox.drawCircle({
            x: x,
            y: y,
            r: 1.5,
            color: "blue"
        });

        last_x = x;
        last_y = y;
    }


};
function NKTimeLineChart ( wrapper_id, w = 600 ) {
    this.wrapper_id = wrapper_id;
    this.drawbox = null;
    this.horizontal = true;
    this.px_per_second = -1;
    this.w = w;


    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );
}

NKTimeLineChart.prototype.setSize = function ( w = 600 ) {
    this.w = w;
}

NKTimeLineChart.prototype.setScale = function ( px_per_second = 0.1 ) {
    this.px_per_second = px_per_second;
}

NKTimeLineChart.prototype.setMouseMoveCbk = function ( cbk ) {
    let self = this;

    this.drawbox.onMouseMoveCbk = function (x, y) {
        cbk(x, y, null);
    }
}


NKTimeLineChart.prototype.drawValues = function ( min_timestamp, max_timestamp, milliseconds = true ) {
    let min_timestamp_s = min_timestamp.nkdiv(1000); //milliseconds to seconds
    let max_timestamp_s = max_timestamp.nkdiv(1000);


    if ( this.px_per_second === -1 ) this.px_per_second = (this.w).nkdiv( max_timestamp_s.nkminus(min_timestamp_s) );

    this.w = max_timestamp_s.nkminus(min_timestamp_s).nkmul(this.px_per_second);//3600s = 1h

    this.drawbox.clean();

    if ( this.horizontal ) {
        this.drawbox.setSize( this.w, 28 );
    } else {
        this.drawbox.setSize( 50, this.w );

        console.error("NKScaleChart vertical: Not implemented.");
        return;
    }

    let min_timestamp_obj = new Date( min_timestamp );
    let next_hour = new Date( min_timestamp );
    next_hour.setHours(min_timestamp_obj.getHours() + 1, 0, 0, 0);
    let diff_ms = NKDate.getUnixTimestamp(next_hour) - min_timestamp_obj;

    let total_hours = Math.floor( max_timestamp.nkminus(min_timestamp).nkdiv(3600000) );

    let first_line_x = diff_ms.nkdiv(1000).nkmul(this.px_per_second);



    for ( let i = 0; i < total_hours; i++ ) {
        this.drawbox.drawLine({
            x: first_line_x,
            y: 0,
            x2: first_line_x,
            y2: 4,
        });


        let h_text = NKDate.getString( next_hour, "hh:mm" );
        let d_text =  NKDate.getString( next_hour, "DD/MM" )

        this.drawbox.drawText({
            x: first_line_x,
            y: 5,
            text: h_text,
            font_size: 10,
            font_family: "Arial, sans-serif",
        });
        this.drawbox.drawText({
            x: first_line_x,
            y: 14,
            text: d_text,
            font_size: 10,
            font_family: "Arial, sans-serif",
        });

        first_line_x += (3600).nkmul(this.px_per_second); //3600s = 1h

        NKDate.addHours(next_hour, 1);
    }



};
function NKTimeValueChart ( wrapper_id ) {
    this.drawbox = new NKDrawbox( wrapper_id );
    this.timeline_drawbox = null;
    this.valueline_drawbox = null;

    this.zoom_x = 1;
    this.zoom_y = 1;
    this.rectangle_w = 5; //Ancho de la vela, tiene que ser IMPAR para poner la linea central.
    this.rectangle_dist = 8; //Ancho de la vela + ancho del espacio entre velas. Puede ser PAR O IMPAR.
    
    this.drawings = {
        candles: [],
    }

    this.config = {
        min_price: 0,
        max_price: 0,
        num_rectangles: 0,
        rectangle_w: 5, //Este no se toca, el otro se modifica segun el zoom.
        rectangle_dist: 8,
    }

    
    if ( window.devicePixelRatio !== 1 ) {
        console.warn( "NKTimeValueChart: The browser zoom level is not set to 100%. This may affect visual rendering." );
    }

    this.configRectangles();
}

NKTimeValueChart.prototype.configTimeLine = function ( wrapper_id, candle_1_date, candle_2_date ) {
    this.timeline_drawbox = new NKDrawbox( wrapper_id );
    this.timeline_drawbox.setSize( this.drawbox.w, 28 );

    let total_rectangles = this.config.num_rectangles;

    let miliseconds_diff = candle_2_date - candle_1_date;
    //let date_aux = new Date(candle_1_date.getTime());

    for ( let i = 0; i < total_rectangles; i++ ) {
        if ( i % 10 !== 0 ) continue;

        let x = i.nkmul(this.rectangle_dist).nksum( this.rectangle_w.nkminus(1).nkdiv(2) );

        this.timeline_drawbox.drawLine({
            x: x,
            y: 0,
            x2: x,
            y2: 4,
        });

        let date_aux = new Date(candle_1_date.getTime() + miliseconds_diff.nkmul(i) );

        let h_text = NKDate.getString( date_aux, "hh:mm" );
        let d_text =  NKDate.getString( date_aux, "DD/MM" )

        this.timeline_drawbox.drawText({
            x: x,
            y: 5,
            text: h_text,
            font_size: 10,
            font_family: "Arial, sans-serif",
        });
        this.timeline_drawbox.drawText({
            x: x,
            y: 14,
            text: d_text,
            font_size: 10,
            font_family: "Arial, sans-serif",
        });
        
    }
    
}

NKTimeValueChart.prototype.configValueLine = function ( wrapper_id, gap_px = 25 ) {
    this.valueline_drawbox = new NKDrawbox( wrapper_id );
    this.valueline_drawbox.setSize( 50, this.drawbox.h );

    let h_aux = 1;

    while ( h_aux < this.drawbox.h ) {
        this.valueline_drawbox.drawLine({
            x: 0,
            by: h_aux,
            x2: 5,
            by2: h_aux,
        });

        this.valueline_drawbox.drawText({
            x: 8,
            by: h_aux + 6,
            text: this.getValueFromY(h_aux).toFixed(2),
            font_size: 10,
            font_family: "Arial, sans-serif",
        });

        h_aux += gap_px;
    }

}


NKTimeValueChart.prototype.getYFromValue = function ( price ) {
    let px_per_value = (this.drawbox.h).nkdiv( this.config.max_price.nkminus(this.config.min_price) );
    return price.nkminus(this.config.min_price).nkmul(px_per_value);
}
NKTimeValueChart.prototype.getValueFromY = function ( y ) {
    let px_per_value = (this.drawbox.h).nkdiv( this.config.max_price.nkminus(this.config.min_price) );
    let by = (this.drawbox.h).nkminus(y);
    return by.nkdiv(px_per_value).nksum(this.config.min_price);
}
NKTimeValueChart.prototype.getTimeFromX = function ( x ) {
    let gap = this.rectangle_dist - this.rectangle_w;
    return Math.trunc( (x + (gap/2)) / this.rectangle_dist );
}
NKTimeValueChart.prototype.getXFromTime = function ( time_i ) {
    let gap = this.rectangle_dist - this.rectangle_w;
    return time_i.nkmul(this.rectangle_dist).nkminus(gap/2);
}

NKTimeValueChart.prototype.setConfig = function ( num_rectangles = 0, min_price = 0, max_price = 100 ) {
    this.config.num_rectangles = num_rectangles;
    this.config.min_price = min_price;
    this.config.max_price = max_price;

    let drawbox_h = 300;
    let drawbox_w = (num_rectangles-1).nkmul(this.rectangle_dist).nksum(this.rectangle_w);

    this.drawbox.clean();
    this.drawbox.setSize(drawbox_w, drawbox_h);
} 


NKTimeValueChart.prototype.configRectangles = function ( rectangle_w = 5, gap_px = 3 ) {
    this.config.rectangle_w = rectangle_w;
    this.config.rectangle_dist = rectangle_w.nksum( gap_px );

    if ( rectangle_w % 2 === 0 ) {
        console.error("NKPixelPerfect.configCandles: rectangle_w debe ser impar para que la linea central quede bien alineada.");
    }

    //this.setZoom( this.zoom_x, this.zoom_y );
}

NKTimeValueChart.prototype.setZoom = function ( zoom_x = null, zoom_y = null ) {
    this.zoom_x = (zoom_x !== null ) ? parseInt(zoom_x) : this.zoom_x; //Tiene que ser un valor entero.
    this.zoom_y = (zoom_y !== null ) ? parseInt(zoom_y) : this.zoom_y; 

    let rectangle_growth = (2).nkmul( this.zoom_x - 1 ); //Cada unidad de zoom crece 2px el ancho de la vela (1px por lado).
    let chart_h_growth = (10).nkmul( this.zoom_y - 1 ); //Cada unidad de zoom crece 10px la altura del chart.

    this.rectangle_w = this.config.rectangle_w.nksum(rectangle_growth);
    this.rectangle_dist = this.config.rectangle_dist.nksum(rectangle_growth);
    //this.chart_h = this.config.chart_h.nksum(chart_h_growth);

    this.repaint();
}


NKTimeValueChart.prototype.addCandle = function ( time_i, high, open, close, low, color = null ) {

    this.drawings.candles.push({
        time_i: time_i,
        high: high,
        open: open,
        close: close,
        low: low,
        color: color
    });

    this.drawCandle( time_i, high, open, close, low, color );
}

NKTimeValueChart.prototype.repaint = function () {
    this.drawbox.clean();
    //this.timeline_drawbox.clean();
    //this.valueline_drawbox.clean();

    this.setConfig( this.config.num_rectangles, this.config.min_price, this.config.max_price );
    //this.configTimeLine( this.timeline_drawbox.wrapper_id, new Date(this.drawings.candles[0].time_i), new Date(this.drawings.candles[1].time_i) );
    //this.configValueLine( this.valueline_drawbox.wrapper_id, 25 );

    for ( let i = 0; i < this.drawings.candles.length; i++ ) {
        let candle = this.drawings.candles[i];
        this.drawCandle( candle.time_i, candle.high, candle.open, candle.close, candle.low, candle.color );
    }
}

NKTimeValueChart.prototype.drawCandle = function ( time_i, high, open, close, low, color = null ) {
    
    let default_color = open < close ? "#EF5350" : "#26A69A";
    if ( color === null ) color = default_color;
    

    let candle_x = time_i.nkmul(this.rectangle_dist);
    let line_x = candle_x.nksum( this.rectangle_w.nkminus(1).nkdiv(2) );

    open = this.getYFromValue(open);
    close = this.getYFromValue(close);
    high = this.getYFromValue(high);
    low = this.getYFromValue(low);


    this.drawbox.drawLine({
        x: line_x,
        by: high,
        x2: line_x,
        by2: low,
        w: 1,
        color: color,
    });

    this.drawbox.drawRect({
        x: candle_x,
        by: Math.max(open, close),
        w: this.rectangle_w,
        h: open.nkminus(close).nkabs(),
        color: color
    });

}


NKTimeValueChart.prototype.setMouseMoveCbk = function ( cbk = (x, y, time_i, price_value) => {} ) {
    let self = this;
    
    this.drawbox.onMouseMoveCbk = function (x, y) {
        cbk(x, y, self.getTimeFromX(x), self.getValueFromY(y) );
    }
}
;var NKClipboard = {};

NKClipboard.set = function( str ) {
    const el = document.createElement('textarea');
    el.style.position = 'absolute';
    el.style.left = '-10000px';
    el.readonly = true;
    el.value = str;

    document.body.appendChild( el );
    const selected = (document.getSelection().rangeCount > 0) ? document.getSelection().getRangeAt(0) : false;
    el.select();

    document.execCommand( 'copy' );
    document.body.removeChild( el );

    if ( selected ) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange( selected );
    }
};

NKClipboard.get = function() {
    return navigator.clipboard.readText();
};
;var NKContextMenu = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

var nkcontextmenu_event_listener = new NKEventListener();
NKContextMenu = { ...nkcontextmenu_event_listener };



NKContextMenu.start = function() {
    if ( NK.isset(NKContextMenu.loaded) && NKContextMenu.loaded === true ) return;
    NKContextMenu.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }

    if ( document.body === null ) {
        throw "The \<body\> tag must be fully loaded before calling NKContextMenu.start()";
    }

    NKPosition.start();

    if ( !document.getElementById("NKContextMenu") ) {
        let d = document.createElement("div");
        d.setAttribute("id", "NKContextMenu");
        document.body.appendChild(d);
    }

    document.getElementById("NKContextMenu").style.display = "none";

    let lastTarget = null;

    document.addEventListener('contextmenu', function (e){
        let target = e.target;
        lastTarget = target;

        NKContextMenu.dispatchEvent('onOpen', {target: target});
        let context_menu_element = document.getElementById("NKContextMenu");

        if ( context_menu_element?.children.length === 0 ) {
            context_menu_element.style.display = "none";

        } else {
            context_menu_element.style.display = "block";
            document.querySelectorAll("#NKContextMenu .NKSubmenu").forEach(e => e.style.display = "none");
            context_menu_element.style.left = NKPosition.getMouseX() + "px";
            context_menu_element.style.top = NKPosition.getMouseY() + "px";
            e.preventDefault();
        }

    });

    document.addEventListener('mouseup', function (e){
        if ( e.button === 2 ) return; //Right click
        let menu = document.getElementById("NKContextMenu");
        if (!menu || getComputedStyle(menu).display === "none") return;

        let target = e.target;

        if ( target.classList.contains("NKItem") ) {
            NKContextMenu.dispatchEvent('onClose', {
                id: target.getAttribute('data-id'),
                text: target.querySelector(".NKTitle")?.textContent,
                target: lastTarget,
                button: target
            });

        } else {
            NKContextMenu.dispatchEvent('onClose', {id: null, target: lastTarget, button: null});

        }

        document.getElementById("NKContextMenu").style.display = "none";


    });

    NKContextMenu.refresh();

};

NKContextMenu.setContent = function( content ) {
    var newContent = [];

    function createItem( id, name, icon_data, submenu_items ) {
        let item = document.createElement("div");
        let icon = document.createElement("div");
        let title = document.createElement("div");
        item.classList.add('NKItem');
        icon.classList.add('NKIcon');
        title.classList.add('NKTitle');

        item.setAttribute('data-id', id);
        title.textContent = name;

        if ( !NK.empty(icon_data) ) {
            if ( icon_data instanceof Node ) {
                icon.appendChild(icon_data);
            } else {
                icon.innerHTML = icon_data;
            }
            icon.style.marginRight = '5px';
        }

        item.appendChild(icon);
        item.appendChild(title);

        if ( submenu_items !== null ) {
            let submenu = document.createElement("div");
            submenu.classList.add('NKSubmenu');
            submenu_items.forEach(item => submenu.appendChild(item));
            item.classList.add('NKArrow');
            item.appendChild(submenu);
        }

        return item;
    }

    function fillData( aux ) {
        let item_list = [];

        for ( let i = 0; i < aux.length; i++ ) {
            let it = aux[i];

            if ( it.type === "item" ) {
                item_list.push( createItem(it.id, it.text, it.icon, null) );

            } else if ( it.type === "menu" ) {
                let submenu_items = fillData( it.items );
                item_list.push( createItem(it.id, it.text, it.icon, submenu_items) );

            } else if ( it.type === "divider" ) {
                let divider = document.createElement("div");
                divider.classList.add('NKDivider');
                item_list.push( divider );
            }

        }

        return item_list;
    }

    if ( !NK.empty(content) ) newContent = fillData( content );

    let wrapper = document.getElementById("NKContextMenu");
    wrapper.innerHTML = '';
    newContent.forEach(item => wrapper.appendChild(item));

    NKContextMenu.refresh();
}

NKContextMenu.refresh = function() {

    function handleMouseEnter(event) {
        let element = event.currentTarget;

        let submenus = element.parentNode.querySelectorAll('.NKSubmenu');
        submenus.forEach(submenu => submenu.style.display = 'none'); //Hide all submenus

        let submenu = element.querySelector('.NKSubmenu');
        if (!submenu) return; //Es un item normal, no un submenu

        submenu.style.display = 'block';
        submenu.style.left = (element.offsetWidth - 5) + 'px';
    }

    document.querySelectorAll('.NKItem').forEach(item => {
        item.removeEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseenter', handleMouseEnter);
    });

}


;let NKDate = {};


NKDate.set = function( date_obj, dd = null, mm = null, yyyy = null, h = null, m = null, s = null, ms = null ) {
    date_obj.setTime( new Date( yyyy, mm-1, dd, h, m, s, ms ).getTime() );
    return date_obj;
};

NKDate.clone = function ( date_obj ) {
    return new Date(date_obj.getTime());
};

NKDate.setFromString = function( date_obj, str_date, date_pattern ) {

    let date_parts = str_date.split(/(?:\/|-| |:|\\)+/);
    let pattern_parts = date_pattern.split(/(?:\/|-| |:|\\)+/);

    if ( date_parts.length !== pattern_parts.length ) {
        throw "Date (" + str_date + ") does not fit the pattern (" + date_pattern + ")";
    }

    date_obj.setHours(0,0,0,0);
    for ( let i = 0; i < pattern_parts.length; i++ ) {
        switch ( pattern_parts[i] ) {
            case 'DD': NKDate.setDay(date_obj, date_parts[i]); break;
            case 'MM': NKDate.setMonth(date_obj, date_parts[i]); break;
            case 'YYYY': NKDate.setYear(date_obj, date_parts[i]); break;
            case 'YY': NKDate.setYear(date_obj, date_parts[i]); break;
            case 'hh': NKDate.setHour(date_obj, date_parts[i]); break;
            case 'mm': NKDate.setMinute(date_obj, date_parts[i]); break;
            case 'sss': NKDate.setMilisecond(date_obj, date_parts[i]); break;
            case 'ss': NKDate.setSecond(date_obj, date_parts[i]); break;
        }
    }

    return date_obj;
};

NKDate.getString = function( date_obj, format = 'DD/MM/YYYY' ) {
    let result = format;

    result = result.replaceAll('DD', NKDate.getDay(date_obj, true));
    result = result.replaceAll('MM', NKDate.getMonth(date_obj, true));
    result = result.replaceAll('YYYY', NKDate.getYear(date_obj, true));
    result = result.replaceAll('YY', NKDate.getYear(date_obj, false));
    result = result.replaceAll('hh', NKDate.getHour(date_obj, true));
    result = result.replaceAll('mm', NKDate.getMinute(date_obj, true));
    result = result.replaceAll('sss', NKDate.getMillisecond(date_obj, true));
    result = result.replaceAll('ss', NKDate.getSecond(date_obj, true));

    return result;
};

NKDate.getDay = function( date_obj, two_digits = true ) {
    let d = date_obj.getDate();
    if ( two_digits ) d = d.toString().padStart(2, "0");
    return d;
};

NKDate.setDay = function( date_obj, day ) {
    if ( day === null ) return;
    date_obj.setDate( day );
    return date_obj;
};

NKDate.getMonth = function( date_obj, two_digits = true ) {
    let m = date_obj.getMonth()+1;
    if ( two_digits ) m = m.toString().padStart(2, "0");
    return m;
};

NKDate.setMonth = function( date_obj, month ) {
    if ( month === null ) return;
    date_obj.setMonth( parseInt(month)-1 );
    return date_obj;
};

NKDate.getYear = function( date_obj, four_digits = true ) {
    if ( four_digits ) return date_obj.getFullYear();
    let y = date_obj.getYear();
    if ( y > 100 ) y -= 100;
    return y;
};

NKDate.setYear = function( date_obj, year ) {
    if ( year === null ) return;
    if ( parseInt(year) < 100) year = "20"+year;
    date_obj.setFullYear( year );
    return date_obj;
};

NKDate.getHour = function( date_obj, two_digits = true ) {
    let h = date_obj.getHours();
    if ( two_digits ) h = h.toString().padStart(2, "0");
    return h;
};

NKDate.setHour = function( date_obj, hour ) {
    if ( hour === null ) return;
    date_obj.setHours( hour );
    return date_obj;
};

NKDate.getMinute = function( date_obj, two_digits = true ) {
    let m = date_obj.getMinutes();
    if ( two_digits ) m = m.toString().padStart(2, "0");
    return m;
};

NKDate.setMinute = function( date_obj, minute ) {
    if ( minute === null ) return;
    date_obj.setMinutes( minute );
    return date_obj;
};

NKDate.getSecond = function( date_obj, two_digits = true ) {
    let s = date_obj.getSeconds();
    if ( two_digits ) s = s.toString().padStart(2, "0");
    return s;
};

NKDate.setSecond = function( date_obj, second ) {
    if ( second === null ) return;
    date_obj.setSeconds( second );
    return date_obj;
};

NKDate.getMillisecond = function( date_obj, three_digits = true ) {
    let ms = date_obj.getMilliseconds();
    if ( three_digits ) ms = ms.toString().padStart(3, "0");
    return ms;
};

NKDate.setMilisecond = function( date_obj, milisecond ) {
    if ( milisecond === null ) return;
    date_obj.setMilliseconds( milisecond );
    return date_obj;
};

NKDate.getUnixTimestamp = function ( date_obj ) {
    return date_obj.getTime();
};

NKDate.addMonths = function( date_obj, months ) {
    date_obj.setMonth(date_obj.getMonth() + months);
    return date_obj;
};

NKDate.addHours = function ( date_obj, hours ) {
    return NKDate.addMiliseconds(date_obj, (hours * 60) * 60000);
};

NKDate.addMinutes = function ( date_obj, minutes ) {
    return NKDate.addMiliseconds(date_obj, minutes * 60 * 1000);
};

NKDate.addSeconds = function ( date_obj, seconds ) {
    return NKDate.addMiliseconds(date_obj, seconds * 1000);
};

NKDate.addMiliseconds = function ( date_obj, miliseconds ) {
    date_obj.setTime( date_obj.getTime() + miliseconds );
    return date_obj;
};

NKDate.print = function ( date_obj ) {
    console.log( date_obj.toLocaleString() );
};

NKDate.equals = function ( date_1, date_2, compare_time = true ) {
    if ( compare_time ) return (date_1.getTime() === date_2.getTime());
    if ( date_1.getDate() !== date_2.getDate() ) return false;
    if ( date_1.getMonth() !== date_2.getMonth() ) return false;
    if ( date_1.getFullYear() !== date_2.getFullYear() ) return false;
    return true;
}

NKDate.daysInMonth = function( year, month ) {
    if ( month === 0 ) throw "Month 0 does not exist, January is month 1.";
    return 32 - new Date(year, month-1, 32).getDate();
};


// start_on_sunday = false; 0: Monday, 1: Tuesday, 2: Wednesday ...
// start_on_sunday = true;  0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday ...
NKDate.firstDayOfMonth = function ( year, month, start_on_sunday = false ) {
    if ( month === 0 ) throw "Month 0 does not exist, January is month 1.";
    let fd = new Date(year, month-1).getDay();
    if ( start_on_sunday ) return fd;
    return (fd === 0) ? 6 : fd-1;
};


NKDate.getDatesBetween = function ( date_start_obj, date_end_obj = null ) {
    if ( date_end_obj === null ) date_end_obj = date_start_obj;

    let dateArray = [];
    let currentDate = new Date(date_start_obj);

    while ( currentDate <= date_end_obj ) {
        dateArray.push( new Date( currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0,0,0,0 ) );
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
};



NKDate.getCalendar = function( year, month, add_empty_days = true, start_on_sunday = false) {
    let calendar = [];
    let today = new Date();
    let current_year_month = (year === today.getFullYear() && month === today.getMonth()+1);

    if ( add_empty_days ) {
        let firstDay = NKDate.firstDayOfMonth(year, month, start_on_sunday);
        for ( let i = 0; i < firstDay; i++ ) calendar.push({day: "", today: false, date: null});
    }

    let daysInMonth = NKDate.daysInMonth(year, month);
    for ( let i = 0; i < daysInMonth; i++ ) {
        calendar.push({day: i+1, today: (current_year_month && i+1 === today.getDate()), date: new Date(year, month-1, i+1)});
    }

    return calendar;
};

NKDate.setCalendarTasks = function ( calendar, tasks, cal_date_name, cal_tasklist_name, task_startdate_name, task_enddate_name ) {

    for ( let i = 0; i < tasks.length; i++ ) {
        let task = tasks[i];
        let task_start = ( task[task_startdate_name] === "0000-00-00 00:00:00" ) ? null : new Date(task[task_startdate_name].replace(/-/g, "/")).getTime();
        let task_end = ( task[task_enddate_name] === "0000-00-00 00:00:00" ) ? null : new Date(task[task_enddate_name].replace(/-/g, "/")).getTime();

        for ( let c = 0; c < calendar.length; c++ ) {
            let cal = calendar[c];
            if ( cal[cal_date_name] === null ) continue;

            let day_start = cal[cal_date_name].getTime();
            let day_end = day_start + 86399999;

            if ( task_end === null ) {
                if (task_start >= day_start && task_start <= day_end) { //1day = 86400000ms
                    cal[cal_tasklist_name].push(NKObject.clone(task));
                }
            } if ( task_start === null ) {
                console.error("Task with date_end without date_start");
            } else {
                if ( task_end >= day_start && task_start <= day_end) {
                    cal[cal_tasklist_name].push(NKObject.clone(task));
                }
            }
        }
    }
};
;let NKDebounce = {
    timeoutId: {}
};


NKDebounce.callOnce = function ( func, ms = 200 ) {
    let call_line = NKDebounce.getCallLine();

    clearTimeout( NKDebounce.timeoutId[call_line] );

    NKDebounce.timeoutId[call_line] = setTimeout(() => {
        func();
    }, ms);

}

NKDebounce.getCallLine = function () {
    const stack = new Error().stack;
    const match = stack.match(/\(([^)]+)\)/);
    let call_line = match ? match[1] : null;

    if ( call_line === null ) {
        console.error("NKDebounce error.");
        return "";
    }

    call_line = call_line.split("/");
    return call_line[call_line.length - 1];
}
;NKDomTemplate = {};
NKDom = {};

NKDomTemplate.register = function ( template_name, template_code ) {

    if ( typeof customElements.get(template_name) !== "undefined" ) {
        console.error("Error, " + template_name + " is already registered.");
        return;
    }

    customElements.define(template_name,
        class extends HTMLElement {
            connectedCallback() {
                this.attachShadow({mode: 'open'});
                this.shadowRoot.innerHTML = template_code;
            }
        }
    );

}


NKDomTemplate.start = function () {
    let doc_templates = document.querySelectorAll( 'template' );

    for ( let i = 0; i < doc_templates.length; i++ ) {
        NKDomTemplate.register( doc_templates[i].attributes.name.value, doc_templates[i].innerHTML );
    }

}


NKDomTemplate.fill = function ( template_name, template_data ) {
    let content_array = Array.isArray(template_data) ? template_data : [template_data];
    let html_result = "";

    for ( let i = 0; i < content_array.length; i++ ) {

        html_result += "<" + template_name + ">";

        for (const [key, value] of Object.entries(content_array[i])) {
            html_result += '<span slot="' + key + '">' + value + '</span>';
        }

        html_result += "</" + template_name + ">";

    }

    return html_result;
}

NKDom.parseIdOrClass = function ( element_id_or_class ) {
    let result = {
        is_class: false,
        is_id: false,
        name: ""
    };
    if ( element_id_or_class.length === 0 ) return result;

    result.is_id = ( element_id_or_class[0] === "#" );
    result.is_class = ( element_id_or_class[0] === "." );
    result.name = element_id_or_class.slice(1);

    return result;
}

NKDom.select = function ( element_id_or_class ) {
    let result = document.querySelectorAll( element_id_or_class );
    return ( element_id_or_class[0] === "#" ) ? result[0] : result;
}


//Para uso interno
NKDom.getElementList = function ( element ) {
    if ( typeof element === 'string' ) element = NKDom.select( element );
    if ( element instanceof NodeList ) return element;
    if ( element instanceof Node ) return [element];
    return [];
}

//Para uso interno
NKDom.getElement = function ( element ) {
    if ( typeof element === 'string' ) element = NKDom.select( element );
    if ( element instanceof NodeList && element.length > 0 ) return element[0];
    if ( element instanceof Node ) return element;
}

// tag_name = "div"
NKDom.getChildren = function ( element, tag_name = "" ) {
    let result = [];
    tag_name = tag_name.toLowerCase();

    NKDom.getElementList(element).forEach(function( el, i ) {
        for ( let i = 0; i < el.children.length; i++ ) {
            if ( tag_name === "" || el.children[i].tagName.toLowerCase() === tag_name ) {
                result.push(el.children[i]);
            }
        }
    });

    //Pasamos el array a NodeList
    var emptyNodeList = document.createDocumentFragment().childNodes;
    var resultNodeList = Object.create(emptyNodeList, {
        'length': {value: result.length, enumerable: false},
        'item': {"value": function(i) {return this[+i || 0];}, enumerable: false}
    });
    result.forEach((v, i) => resultNodeList[i] = v);

    return resultNodeList;
}

NKDom.getClosest = function ( element, id_or_class ) {
    element = NKDom.getElement(element);
    id_or_class = NKDom.parseIdOrClass(id_or_class);

    if ( id_or_class.is_class ) {
        while (element && !element.classList.contains(id_or_class.name)) element = element.parentNode;
    } else if ( id_or_class.is_id ) {
        while (element && element.id !== id_or_class.name) element = element.parentNode;
    }

    return element;
}


NKDom.setCss = function ( element, css_property_name, css_property_value ) {
    let css_prop = css_property_name.replace(/-([a-z])/g, function(match, letra) {return letra.toUpperCase();});

    NKDom.getElementList(element).forEach(function( el, i ) {
        el.style[css_prop] = css_property_value;
    });
}

NKDom.getCss = function ( element, css_property_name ) {
    let css_prop = css_property_name.replace(/-([a-z])/g, function(match, letra) {return letra.toUpperCase();});

    let result = [];

    NKDom.getElementList(element).forEach(function( el, i ) {
        result.push( window.getComputedStyle(el)[css_prop] );
    });

    if ( result.length === 0 ) return;
    if ( result.length === 1 ) return result[0];
    return result;
}

NKDom.setAttribute = function ( element, attribute_name, attribute_value ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.setAttribute(attribute_name, attribute_value);
    });
}

NKDom.getAttribute = function ( element, attribute_name ) {
    element = NKDom.getElementList(element);
    if ( element.length === 0 ) return;

    return element[0].getAttribute( attribute_name );
}

NKDom.addClass = function ( element, class_name ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.classList.add(class_name);
    });
}

NKDom.removeClass = function ( element, class_name ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.classList.remove(class_name);
    });
}

NKDom.hasClass = function ( element, class_name ) {
    let elements = NKDom.getElementList(element);

    for ( var i = 0; i < elements.length; i++ ) {
        if ( elements[i].classList.contains(class_name) ) return true;
    }

    return false;
}

NKDom.setHtml = function ( element, element_html ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.innerHTML = element_html;
    });
}

NKDom.appendHtml = function ( element_id_or_class, element_html ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        el.insertAdjacentHTML("afterend", element_html);
    });
}

NKDom.addEventListener = function ( element, event_name, event_listener_function, remove_previous = true ) {
    NKDom.getElementList(element).forEach(function( el, i ) {
        if ( remove_previous ) el.removeEventListener(event_name, event_listener_function);
        el.addEventListener(event_name, event_listener_function);
    });
};let NKDrag = {};

let nkdrag_event_listener = new NKEventListener();
NKDrag = { ...nkdrag_event_listener };

NKDrag.selection = { element: null };

NKDrag.start = function( reactable ) {
    if ( NK.isset(NKDrag.loaded) && NKDrag.loaded === true ) return;
    NKDrag.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include NKPosition.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKDrag.reload );
    if ( window.loaded === true ) NKDrag.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKDrag );
    }
    function onMouseMove(e) {
        if ( NKDrag.selection.element != null ) {
            let left = NKPosition.getMouseX() - NKDrag.selection.offset[0];
            let top = NKPosition.getMouseY() - NKDrag.selection.offset[1];

            NKDrag.moveElement( NKDrag.selection.element, left, top );
        }
    }

    NKDom.addEventListener( document, 'mousemove', onMouseMove );

    function onMouseUp( e ) {
        NKDrag.selection.element = null;
    }

    NKDom.addEventListener( document, 'mouseup', onMouseUp );
};

NKDrag.moveElement = function( element, left = 0, top = 0 ) {

    element.style.transform = `translate(${left}px, ${top}px)`;

    NKDrag.dispatchEvent('onDrag', {
        e: element,
        position: {left: left, top: top}
    });
    
}

NKDrag.reload = function() {

    function onMouseDown( e ) {
        NKDrag.selection.element = NKDom.getClosest(this, '.NKDrag_dst');
        NKDrag.selection.offset = NKPosition.getMouse();

        try {
            const regex = /translate\(\s*([-+]?\d*\.?\d+px)\s*,\s*([-+]?\d*\.?\d+px)\s*\)/;
            const match = NKDrag.selection.element.style.transform.match(regex);

            NKDrag.selection.offset[0] -= parseFloat(match[1]); //translateX
            NKDrag.selection.offset[1] -= parseFloat(match[2]); //translateY
        } catch (e){}

    }

    NKDom.addEventListener( '.NKDrag_src', 'mousedown', onMouseDown );

};
;/*if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before loader.js";
}*/

function NKDrawbox ( wrapper_id, w = 400, h = 200 ) {
    this.wrapper = null;
    this.shadow = null;
    this.onMouseMoveCbk = null;
    this.drawings = [];
    this.h = h;
    this.w = w;

    this.wrapper = document.getElementById(wrapper_id);

    if ( this.wrapper === null ) return console.error("NKDrawbox: Error, invalid id '" + wrapper_id + "'");
    this.wrapper.style.display = 'inline-block';
    this.wrapper.style.width = w + 'px';
    this.wrapper.style.height = h + 'px';
    this.wrapper.style.overflow = 'hidden';
    this.wrapper.style.position = 'relative';
    this.wrapper.innerHTML = '';

    //If initialized, get the existent shadowRoot
    this.shadow = this.wrapper.shadowRoot || this.wrapper.attachShadow({ mode: 'open' });

    this.wrapper.addEventListener("mousemove", (event) => {
        /*const rect = this.shadow.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log(`Posición del mouse en el div: X: ${x}, Y: ${y}`);*/

        /*const x = event.offsetX;
        const y = event.offsetY;
        console.log(`Posición del mouse en el div: X: ${x}, Y: ${y}`);*/
        if ( this.onMouseMoveCbk !== null ) this.onMouseMoveCbk(event.offsetX, event.offsetY);
    });
}

NKDrawbox.prototype.clean = function () {
    this.shadow.innerHTML = '';
    this.first_time = false;
}

NKDrawbox.prototype.setSize = function ( w = 400, h = 200 ) {
    this.wrapper.style.width = w + 'px';
    this.wrapper.style.height = h + 'px';
    this.h = h;
    this.w = w;
}


NKDrawbox.prototype._drawDiv = function ( args ) {
   // console.log(args);
    const new_div = document.createElement('div');

    if ( !this.first_time ) {
        this.first_time = true;
        
        const style = document.createElement('style');
        //Todo lo de dentro del shadow son divs, sino pondria un nombre de clase
        style.textContent = `
        div {
            position: absolute;
        }
        `;
        //transform-origin: left top;
        this.shadow.appendChild(style);
    }
    

    let class_array = [];
    
    if ( typeof args.class === 'string' ) {
        class_array.push(args.class);
    } else if ( Array.isArray(args.class) ) {
        class_array.push(...args.class);
    }

    if ( class_array.length > 0 ) new_div.className = class_array.join(' ');
    

    //new_div.style.position = 'absolute';
    //new_div.style.transformOrigin = args.origin ? args.origin : 'top left';

    if ( NK.isset(args.origin) ) new_div.style.transformOrigin = args.origin;

    if ( NK.isset(args.h) && args.h < 0 ) { //Si le ponemos una altura negativa
        args.h = (args.h).nkabs();
        if ( NK.isset(args.y) ) args.y = (args.y).nksubtract(args.h);
    }

    if ( NK.isset(args.x) ) new_div.style.left = args.x + 'px';
    if ( NK.isset(args.y) ) new_div.style.top = args.y + 'px';

    if ( NK.isset(args.w) ) new_div.style.width = args.w + 'px';
    if ( NK.isset(args.h) ) new_div.style.height = args.h + 'px';

    if ( NK.isset(args.color) ) new_div.style.backgroundColor = args.color;

    if ( NK.isset(args.border_radius) ) new_div.style.borderRadius = args.border_radius + '%';

    if ( args.border_px || args.border_color || args.border_style ) {
        if ( !NK.isset(args.border_px) ) args.border_px = 1;
        if ( !NK.isset(args.border_color) ) args.border_color = "black";
        if ( !NK.isset(args.border_style) ) args.border_style = "solid"; //dotted
        if ( args.border_px > 0 ) new_div.style.border  =  args.border_px + 'px ' + args.border_style + ' ' + args.border_color;
    }

    if ( args.border_top_px || args.border_top_color || args.border_top_style ) {
        if ( !NK.isset(args.border_top_px) ) args.border_top_px = 1;
        if ( !NK.isset(args.border_top_color) ) args.border_top_color = "black";
        if ( !NK.isset(args.border_top_style) ) args.border_top_style = "solid"; //dotted
        if ( args.border_top_px > 0 ) new_div.style.borderTop  =  args.border_top_px + 'px ' + args.border_top_style + ' ' + args.border_top_color;
    }

    if ( args.border_right_px || args.border_right_color || args.border_right_style ) {
        if ( !NK.isset(args.border_right_px) ) args.border_right_px = 1;
        if ( !NK.isset(args.border_right_color) ) args.border_right_color = "black";
        if ( !NK.isset(args.border_right_style) ) args.border_right_style = "solid"; //dotted
        if ( args.border_right_px > 0 ) new_div.style.borderRight  =  args.border_right_px + 'px ' + args.border_right_style + ' ' + args.border_right_color;
    }

    if ( args.border_left_px || args.border_left_color || args.border_left_style ) {
        if ( !NK.isset(args.border_left_px) ) args.border_left_px = 1;
        if ( !NK.isset(args.border_left_color) ) args.border_left_color = "black";
        if ( !NK.isset(args.border_left_style) ) args.border_left_style = "solid"; //dotted
        if ( args.border_left_px > 0 ) new_div.style.borderLeft  =  args.border_left_px + 'px ' + args.border_left_style + ' ' + args.border_left_color;
    }

    let transform = "";
    if ( NK.isset(args.rotate) ) transform += `rotate(${args.rotate}deg) `;
    new_div.style.transform = transform;

    if ( NK.isset(args.text) ) new_div.textContent = args.text;
    if ( NK.isset(args.font_color) ) new_div.style.color = args.font_color;
    if ( NK.isset(args.font_size) ) new_div.style.fontSize = isNaN(args.font_size) ? args.font_size : args.font_size + "px";
    if ( NK.isset(args.font_family) ) new_div.style.fontFamily = args.font_family;
    if ( NK.isset(args.font_weight) ) new_div.style.fontWeight = args.font_weight;

    

    this.shadow.appendChild(new_div);
}


NKDrawbox.prototype.drawRect = function( args ) {
    if ( NK.isset(args.by) ) args.y = (this.h).nkminus(args.by); //Bottom y
    if ( NK.isset(args.by2) ) args.y2 = (this.h).nkminus(args.by2); //Bottom y2

    let props = {
        x: args.x ?? 0,
        y: args.y ?? 0,
        w: args.w ?? 0,
        h: args.h ?? 0
    }

    if ( NK.isset(args.border_px) && args.border_px > 0 ) props.border_px = args.border_px;
    if ( NK.isset(args.border_color) ) props.border_color = args.border_color;

    if ( args.x && args.x2 ) props.w = (args.x2).nkminus(args.x);
    if ( args.y && args.y2 ) props.h = (args.y2).nkminus(args.y);

    if ( args.class ) props.class = args.class;
    if ( args.color ) props.color = args.color;
    if ( args.border_style ) props.border_style = args.border_style;

    this._drawDiv( props );
};

NKDrawbox.prototype.drawLine = function( args ) {
    if ( NK.isset(args.by) ) args.y = (this.h).nkminus(args.by); //Bottom y
    if ( NK.isset(args.by2) ) args.y2 = (this.h).nkminus(args.by2); //Bottom y2
    
    if ( args.x === args.x2 ) return this._drawVerticalLine( args );

    let props = {
        x: args.x ?? 0,
        y: args.y ?? 0,
        border_top_px: args.w ?? 1,
        border_top_color: args.color ?? "black",
        border_top_style: args.style ?? "solid"
    }

    // Line length
    props.w = ((args.x2??0).nkminus(args.x??0).nkpow(2).nksum( (args.y2??0).nkminus(args.y??0).nkpow(2) )).nksqrt();

    // Angle
    props.rotate = Math.atan2( (args.y2??0).nkminus(args.y??0), (args.x2??0).nkminus(args.x??0) ).nkmul( (180).nkdiv(Math.PI) );

    if ( args.class ) props.class = args.class;

    this._drawDiv(props);
}

NKDrawbox.prototype._drawVerticalLine = function( args ) {
    
    let props = {
        x: args.x, //La posicion es top left, no el centro. No modificar.
        y: args.y ?? 0,
        h: (args.y2??0).nkminus(args.y??0),
        border_left_px: args.w ?? 1,
        border_left_color: args.color ?? "black",
        border_left_style: args.style ?? "solid"
    }


    this._drawDiv(props);
}

NKDrawbox.prototype.drawCircle = function( args ) {
    if ( !NK.isset(args.r) ) args.r = 10;
    let d = (args.r).nkmul(2);

    let props = {
        x: (args.x ?? 0).nkminus( args.r ),
        y: (args.y ?? 0).nkminus( args.r ),
        w: d,
        h: d,
        color: args.color ?? "black",
        border_radius: 50 //Circle
    }

    if ( args.class ) props.class = args.class;

    this._drawDiv(props);
}

NKDrawbox.prototype.drawText = function( args ) {
    if ( !args.text ) return;
    if ( NK.isset(args.by) ) args.y = (this.h).nkminus(args.by); //Bottom y

    let props = {
        x: args.x ?? 0,
        y: args.y ?? 0,
        text: args.text,
    }

    if ( args.class ) props.class = args.class;
    if ( args.font_color ) props.font_color = args.font_color;
    if ( args.font_size ) props.font_size = args.font_size;
    if ( args.font_family ) props.font_family = args.font_family;
    if ( args.font_weight ) props.font_weight = args.font_weight;

    this._drawDiv(props);
};;var NKForm = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before form.js";
}

NKForm.errors = {
    duplicated_fields: true,
    invalid_json: true
};

// TODO change to getInputs
// TODO Works with textarea's ? Are not inputs..
// TODO Best if elements have class NKField
NKForm.getFields = function( form_selector, json ) {

    var values = {};

    $( form_selector + ' :input' ).each(function() {
        if ( NK.empty(this.name) ) return;

        if ( this.name.slice(-2) === "[]" ) {
            var field_name = this.name.substr(0, this.name.length-2);

            if ( !NK.isset(values[field_name]) ) values[field_name] = [];

            values[field_name].push($(this).val());

        } else {

            if ( NKForm.errors.duplicated_fields && NK.isset(values[this.name]) ) {
                throw( 'NKForm.getFields: Duplicated input field with name (' + this.name + ')' );
            }

            var type = $(this).attr('type');

            if ( type === 'checkbox' ) {
                values[this.name] = $(this).prop('checked');
            } else {
                values[this.name] = $(this).val();
            }

        }

    });

    if ( json === true ) return JSON.stringify(values);
    return values;

};

NKForm.setFields = function( form_selector, field_data, json ) {
    if ( NK.empty(field_data) ) return;

    if ( json === true ) {
        try {
            field_data = JSON.parse(field_data);
        } catch (e) {
            if ( NKForm.errors.invalid_json ) throw "NKForm.setFields: Invalid input json. (" + field_data + ")";
            return;
        }
    }

    $( form_selector + ' :input' ).each(function() {
        if ( NK.empty(field_data[this.name]) ) return;

        var type = $(this).attr('type');

        if ( type === 'checkbox' ) {
            $(this).prop('checked', (/^(true|1)$/i).test(field_data[this.name]));
        } else {
            $(this).val( field_data[this.name] );
        }

    });

};

NKForm.clearFields = function( form_selector ) {

    $( form_selector + ' :input' ).each(function() {
        var type = $(this).attr('type');

        if ( type === 'checkbox' ) {
            $(this).prop('checked', false);
        } else {
            $(this).val("");
        }

    });

};


NKForm.send = function( form_selector, url, callback ) {

    $.post(
        url,
        NKForm.getFields(form_selector),
        function( data, status ) {

            if( NK.isset(callback) ) {
                callback( data, status );
            } else {
                location.reload();
            }

        }
    );

};


// ExtensionList = accept=".gif,.jpg,.jpeg,.png,.doc,.docx";
NKForm.fileChooser = function( callback, extension_list, multiple = false, base64 = true ) {
    extension_list = extension_list || "";
    multiple = multiple ? "multiple" : "";
    $('body').append('<input type="file" id="NKtmpfile" accept="'+extension_list+'" ' + multiple +'>');
    var element = document.getElementById("NKtmpfile");
    element.addEventListener('change', async function (e) {
        var file_list = await NKForm._cleanFileList(this.files, base64);
        callback( file_list );
    } , false);
    $('#NKtmpfile').trigger('click');
    element.parentNode.removeChild(element);
};

NKForm.dirChooser = function( start_in, callback ) {
    window.showDirectoryPicker({startIn: start_in}).then((e) => {
        callback( e );
    });
};


NKForm.postFile = function( url, file_obj, args, cbk ) {
    var form_data = new FormData();
    form_data.append( 'file[]', file_obj );
    for ( var key in args ) {
        form_data.append( key, args[key] );
    }

    $.ajax({
        type: 'POST',
        url: url,
        contentType: false,
        processData: false,
        data: form_data,
        success: function ( response ) {
            cbk( response );
        }
    });
}

NKForm.fileDropzone = function ( object, cbk, base64 = true ) {

    object.addEventListener("drop", async function ( e ) {
        e.preventDefault();

        var files = e.dataTransfer.files;

        if ( files.length === 0 ) console.error( "Unable to handle dragged files." );

        var file_list = await NKForm._cleanFileList(files, base64);

        cbk( file_list );
    });

    object.addEventListener("dragover", function ( e ) {
        e.preventDefault();
    });

};

NKForm._cleanFileList = async function ( files, base64 = true ) {
    var result = [];

    for ( var i = 0; i < files.length; i++ ) {
        var file = files[i];
        var r = {
            file_obj: file,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModifiedDate: file.lastModifiedDate,
            lastModified: file.lastModified
        }
        if ( base64 ) r.base64 = await NKForm.getFileBase64( file );

        result.push(r);
    }

    return result;
}

NKForm.getFileBase64 = function ( file_obj ) {

    return new Promise(function( resolve, reject ) {
        var fr = new FileReader();
        fr.onload = function(e) { resolve( this.result ); };
        fr.onerror = function ( e ) { reject(); };

        fr.readAsDataURL( file_obj );
    });

};let NKHttp = {};


NKHttp.mountGETUrl = function( url, params = {} ) {
    if ( Object.keys(params).length === 0 ) return url;

    let queryString = url + '?';

    for ( let param in params ) queryString += param + '=' + encodeURIComponent(params[param]) + '&';

    queryString = queryString.slice( 0, -1 ); // Eliminar el último carácter "&"

    return queryString;
}


NKHttp.syncGET = function( url, params = {}, json = false ) {

    let get_url = NKHttp.mountGETUrl( url, params );

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", get_url, false ); // false for synchronous request
    xmlHttp.send( null ); //En caso de error 500, no se puede evitar el error aunque ponga un try{}catch(e){}

    if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
        let data = xmlHttp.responseText;
        if ( json ) {
            try {
                data = JSON.parse(data);
            } catch (e){
                return {success: false, data: xmlHttp.responseText, err: "Error converting to json.", status: xmlHttp.status };
            }
        }
        return {success: true, data: data, err: null, status: xmlHttp.status};
    }

    return {success: false, data: null, err: xmlHttp.statusText, status: xmlHttp.status };
}


NKHttp.asyncGET = function( url, params = {}, json = false ) {

    let get_url = NKHttp.mountGETUrl( url, params );

    let p = new Promise(function(resolve, reject) {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = function() {
            if ( xmlHttp.readyState === 4 ) {
                if ( xmlHttp.status === 200 ) {
                    let data = xmlHttp.responseText;
                    if ( json ) {
                        try {
                            data = JSON.parse(data);
                        } catch (e){
                            resolve( {success: false, data: xmlHttp.responseText, err: "Error converting to json.", status: xmlHttp.status });
                            return;
                        }
                    }
                    resolve( {success: true, data: data, err: null, status: xmlHttp.status} );
                } else {
                    resolve( {success: false, data: null, err: xmlHttp.statusText, status: xmlHttp.status} );
                }
            }
        };

        xmlHttp.open("GET", get_url, true);
        xmlHttp.send(null);
    });

    return p;
};let NKLoader = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include NKBase.js before loader.js";
}


NKLoader.setSelector = function( loader_selector, error_selector ) {

    NKDom.setCss( loader_selector, 'display', 'none' );
    NKDom.setCss( error_selector, 'display', 'none' );

    window.setInterval(function(){
        if ($.active > 0) {
            NKDom.setCss( loader_selector, 'display', 'block' );
        } else {
            $.active = 0;
            NKDom.setCss( loader_selector, 'display', 'none' );
        }
    }, 500);

    $( document ).ajaxError(function() {
        $.active = 0; // AJAX Post abort.
    });

    if ( document.domain != "localhost" ) {
        window.onerror = function(message, url, lineNumber) {
            $.active = 0;

            if ( NK.isset(error_selector) ) {
                NKDom.setCss( error_selector, 'display', 'block' );
            }

            console.log("Error: ", message, url, lineNumber);
            return true;
        };
    }

};



;var NKModal = {};

NKModal.config = {
    add_close_icon: true,
    close_on_click_outside: true
};

NKModal.reload = function() {

    $('.NKModal .NKCloseIcon').off().on('click', function () {
        $(this).parents('.NKModal').hide();
    });

    if ( NKModal.config.close_on_click_outside ) {
        $('.NKModal').off().on('click', function ( e ) {
            if ( e.target !== this ) return;
            $(this).hide();
        });
    }

};

NKModal.show = function ( div_id ) {
    var id = '#' + div_id;

    if ( $(id).length === 0 ) {
        console.error( "Element " + id + " not found." );
        return;
    }

    var modal_content = $( '.NKModal ' + id );

    if ( modal_content.length === 0 ) {
        let close_icon = NKModal.config.add_close_icon ? '<i class="NKCloseIcon"></i>' : '';
        let new_html = '<div class="NKModal ' + div_id + '">' +
            '            <div class="NKContent">' +
            '                ' + close_icon +
            '            </div>' +
            '        </div>';

        $( id ).after( new_html );
        $( id ).appendTo( ".NKModal." + div_id + " .NKContent" );
        $( id ).show();

        NKModal.reload();
    }

    var modal = $( id ).parents('.NKModal');

    modal.show();
    modal_content.show(); //Hidded by the user
};

NKModal.hide = function ( div_id ) {
    var id = '#' + div_id;

    var modal_content = $( '.NKModal ' + id );
    if ( modal_content.length === 0 ) return;

    var modal = $( id ).parents('.NKModal');
    modal.hide();
};

NKModal.toggle = function ( div_id ) {
    var modal_content = $( '.NKModal #' + div_id );

    if ( modal_content.length === 0 ) {
        NKModal.show( div_id );
    } else {

        var modal = $( "#" + div_id ).parents('.NKModal');

        if ( modal.is(':visible') ) {
            NKModal.hide( div_id );
        } else {
            NKModal.show( div_id );
        }

    }

}
;var NKNotification = {};
NKNotification.timeout = null;

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before loader.js";
}


NKNotification.start = function() {

    if ( $('#NKNotification').length < 1 ) {
        var close_icon_html = '<svg onclick="NKNotification.hide()" class="close-icon" xmlns="http://www.w3.org/2000/svg" stroke="black" width="20" height="20" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        var wrapper = document.createElement("div");
        var content = document.createElement("div");

        wrapper.setAttribute("id", "NKNotification");
        wrapper.style.display = "none";
        wrapper.innerHTML = close_icon_html;

        content.setAttribute("class", "content_wrapper");
        wrapper.append(content);

        document.body.appendChild(wrapper);
    }

}

NKNotification.show = function( content = ["Title", "Subtitle"], ms = 0 ) {
    clearTimeout(NKNotification.timeout);

    document.getElementById("NKNotification").style.display = "block";

    $('#NKNotification .content_wrapper').html("");

    for ( var i = 0; i < content.length; i++ ) {
        if ( typeof content[i] === "string" ) {
            var aux = document.createElement("div");
            aux.setAttribute("class", "content");
            if ( i === 0 ) aux.setAttribute("class", "content bold");
            aux.innerHTML = content[i];
            $('#NKNotification .content_wrapper').append(aux);

        } else {
            $('#NKNotification .content_wrapper').append(content[i]);

        }

    }



    if ( ms > 0 ) NKNotification.timeout = setTimeout(NKNotification.hide, ms);

}

NKNotification.hide = function() {
    clearTimeout(NKNotification.timeout);
    document.getElementById("NKNotification").style.display = "none";

}
;let NKObject = {};

NKObject.clone = function ( obj ) {
    return JSON.parse(JSON.stringify(obj));
}

NKObject.setValue = function ( start_obj, str_obj_path, value ) {
    let path_parts = str_obj_path.split(".");
    let aux_path = "start_obj";

    for ( let i = 0; i < path_parts.length; i++ ) {
        aux_path += "." + path_parts[i];
        if ( eval("typeof " + aux_path) === "undefined" ) eval(aux_path + " = {}");
    }

    eval(aux_path + " = " + JSON.stringify(value));
}

NKObject.getValue = function ( variable, default_value = undefined ) {
    if ( typeof variable === 'undefined' ) return default_value;
    if ( variable == null ) return default_value;
    if ( typeof variable === 'function' ) {
        try {
            return variable();
        } catch (e) {
            return default_value;
        }
    }
    return variable;
}

NKObject.getTypeName = function ( value ) {
    let type = typeof value;
    if ( value === undefined ) return 'undefined';
    if ( type === "string" ) return 'string';
    if ( type === "number" ) return 'number';
    if ( type === "boolean" ) return 'boolean';
    if ( type === "object" && Array.isArray(value) ) return 'array';
    if ( type === "object" && (value === null) ) return 'null';
    if ( type === "object" ) return 'object';
    return 'unknown';
}

NKObject.isType = function ( value, type_str ) {
    return (NKObject.getTypeName(value) === type_str);
}
;var NKPopup = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before popup.js";
}

NKPopup.config = {
    allow_hover: true,
    mouse_margin: 5,
    box_margin: 5
};

NKPopup.start = function( reactable ) {
    if ( NK.isset(NKPopup.loaded) && NKPopup.loaded === true ) return;
    NKPopup.loaded = true;

    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include position.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKPopup.reload );
    if ( window.loaded === true ) NKPopup.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKPopup );
    }

};


NKPopup.reload = function() {

    $('.NKPopup_dst').hide();

    $('.NKPopup_src').off();

    $('.NKPopup_src').on('mousemove', function(){
        var dst = $(this).siblings('.NKPopup_dst');
        var type = NK.isset( dst.attr('nk-type') ) ? dst.attr('nk-type') : "box";
        var align = NK.isset( dst.attr('nk-align') ) ? dst.attr('nk-align').split(",") : ["top","center"];
        var offset = NK.isset( dst.attr('nk-offset') ) ? dst.attr('nk-offset').split(",").map(Number) : [0,0];
        var arrowSize = NK.isset( dst.attr('nk-arrow-size') ) ? dst.attr('nk-arrow-size').split(",").map(Number)[1] : 0;
        var fixedX = dst.attr('nk-x');
        var fixedY = dst.attr('nk-y');

        dst.show();
        var pos = {};

        if ( type === "mouse" ) {
            var src_size = [10, 22];
            var src_pos = NKPosition.getMouse();
            var margin = NKPopup.config.mouse_margin;
        } else if ( type === "box" ) {
            var src_size = [$(this).outerWidth(), $(this).outerHeight()];
            var src_pos = [$(this).offset().left, $(this).offset().top];
            var margin = NKPopup.config.box_margin;
        } else {
            throw ( "Invalid type: " + type );
        }


        if ( align[0] === "top" || align[0] === "bottom" ) {

            if ( !NK.isset(align[1]) || align[1] === "center" ) {
                pos = {left: src_pos[0] - (dst.outerWidth()/2) + (src_size[0]/2), top: src_pos[1]  - dst.outerHeight() - arrowSize - margin};
            } else if ( align[1] === "left" ) {
                pos = {left: src_pos[0] - dst.outerWidth() + src_size[0], top: src_pos[1] - dst.outerHeight() - arrowSize - margin};
            } else if ( align[1] === "right" ) {
                pos = {left: src_pos[0], top: src_pos[1] - dst.outerHeight() - arrowSize - margin};
            } else {
                throw ("Invalid param '" + align[1] + "'");
            }


            if ( align[0] === "bottom" ) pos.top += src_size[1] + dst.outerHeight() + (arrowSize*2) + (margin*2);

        } else if ( align[0] === "left" || align[0] === "right" ) {

            if ( !NK.isset(align[1]) || align[1] === "middle" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin  - arrowSize, top: src_pos[1] - (dst.outerHeight()/2) + (src_size[1]/2)};
            } else if ( align[1] === "top" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin - arrowSize, top: src_pos[1] - dst.outerHeight() + src_size[1] };
            } else if ( align[1] === "bottom" ) {
                pos = {left: src_pos[0] - dst.outerWidth() - margin - arrowSize, top: src_pos[1] };
            } else {
                throw ("Invalid param '" + align[1] + "'");
            }

            if ( align[0] === "right" ) pos.left += src_size[0] + dst.outerWidth() + (arrowSize*2) + (margin*2);

        } else {
            throw ("Invalid param '" + align[0] + "'");
        }


        pos.left = pos.left + offset[0];
        pos.top = pos.top + offset[1];
        if ( NK.isset(fixedX) ) pos.left = fixedX;
        if ( NK.isset(fixedY) ) pos.top = fixedY;

        dst.offset(pos);

    });

    $('.NKPopup_src').on('mouseleave', function(){
        var self = $(this);

        if ( NKPopup.config.allow_hover ) {

            // Without timeout we can't know if mouse are hover popup window.
            window.setTimeout(function(){
                if( self.siblings('.NKPopup_dst:hover').length == 0 ) {
                    self.siblings('.NKPopup_dst').hide();
                } else {
                    self.siblings('.NKPopup_dst:hover').on('mouseleave', function(){
                        $(this).off().hide();
                    });
                }
            }, 50);

        } else {
            self.siblings('.NKPopup_dst').hide();
        }

    });


    // Add arrows
    NK.core.ignoreMutations( 1 ); // Avoid infinite reload loop if (reactable === true)

    $( ".NKPopup_dst" ).each(function( index ) {
        if ( !NK.isset( $(this).attr('nk-arrow-size') ) && !NK.isset( $(this).attr('nk-arrow-offset') ) ) return;
        var arrow_size = NK.isset( $(this).attr('nk-arrow-size') ) ? $(this).attr('nk-arrow-size').split(",").map(Number) : [10,7];
        //var arrow_offset = NK.isset( $(this).attr('nk-arrow-offset') ) ? $(this).attr('nk-arrow-offset') : 0;
        var dst_offset = NK.isset( $(this).attr('nk-offset') ) ? $(this).attr('nk-offset').split(",").map(Number) : [0,0];
        var align = NK.isset( $(this).attr('nk-align') ) ? $(this).attr('nk-align').split(",") : ["top","center"];
        var src = $(this).siblings('.NKPopup_src');

        var arrow_stroke = $( document.createElement("i") );
        arrow_stroke.addClass('NKPopup_arrow_stroke');
        $(this).append(arrow_stroke);

        var arrow_fill = $( document.createElement("i") );
        arrow_fill.addClass('NKPopup_arrow_fill');
        $(this).append(arrow_fill);

        var arrow = { border: 1, stroke_border: [0,0,0,0], fill_border: [0,0,0,0], stroke_colors: ['','','',''], fill_colors: ['','','',''], left: [50,50], top: [0,0] };

        if ( align[0] === "top" ) {
            arrow.border = parseInt($(this).css('border-bottom-width').split('px')[0]);
            arrow.stroke_border = [ (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border), 0, ((arrow_size[0]/2)+arrow.border) ]; // Height Width/2 0 Width/2
            arrow.fill_border = [ arrow_size[1], (arrow_size[0]/2), 0, (arrow_size[0]/2) ];
            arrow.top = [$(this).innerHeight(), $(this).innerHeight()];
            arrow.stroke_colors[0] = $(this).css('border-bottom-color');
            arrow.fill_colors[0] = $(this).css('background-color');

        } else if ( align[0] === "bottom" ) {
            arrow.border = parseInt($(this).css('border-top-width').split('px')[0]);
            arrow.stroke_border = [ 0, ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border) ]; // 0 Width/2 Height Width/2
            arrow.fill_border = [ 0, (arrow_size[0]/2), arrow_size[1], (arrow_size[0]/2) ];
            arrow.top = [(arrow_size[1]*-1)-1, (arrow_size[1]*-1)];
            arrow.stroke_colors[2] = $(this).css('border-top-color');
            arrow.fill_colors[2] = $(this).css('background-color');

        } else if ( align[0] === "right" ) {
            arrow.border = parseInt($(this).css('border-left-width').split('px')[0]);
            arrow.stroke_border = [ ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border), ((arrow_size[0]/2)+arrow.border), 0]; // Width/2 Height Width/2 0
            arrow.fill_border = [ (arrow_size[0]/2), arrow_size[1], (arrow_size[0]/2), 0];
            arrow.stroke_colors[1] = $(this).css('border-left-color');
            arrow.fill_colors[1] = $(this).css('background-color');
            arrow.left[0] = 0 - arrow_size[1] - arrow.border;
            arrow.left[1] = arrow.left[0] + arrow.border;

        } else if ( align[0] === "left" ) {
            arrow.border = parseInt($(this).css('border-right-width').split('px')[0]);
            arrow.stroke_border = [ ((arrow_size[0]/2)+arrow.border), 0, ((arrow_size[0]/2)+arrow.border), (arrow_size[1]+arrow.border) ]; // Width/2 0 Width/2 Height
            arrow.fill_border = [ (arrow_size[0]/2), 0, (arrow_size[0]/2), arrow_size[1] ];
            arrow.stroke_colors[3] = $(this).css('border-right-color');
            arrow.fill_colors[3] = $(this).css('background-color');
            arrow.left[0] = $(this).innerWidth();
            arrow.left[1] = arrow.left[0];
        }

        if ( align[1] === "left" ) {
            arrow.left[0] = $(this).outerWidth() - (src.outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border
        } else if ( align[1] === "center" ) {
            arrow.left[0] = ($(this).outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border;
        } else if ( align[1] === "right" ) {
            arrow.left[0] = (src.outerWidth()/2) - (arrow_size[0]/2) - (arrow.border*2);
            arrow.left[1] = arrow.left[0] + arrow.border
        } else if ( align[1] === "top" ) {
            arrow.top[0] = $(this).outerHeight() - (src.outerHeight()/2) - (arrow_size[0]/2)  - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        } else if ( align[1] === "middle" ) {
            arrow.top[0] = ($(this).outerHeight()/2) - (arrow_size[0]/2) - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        } else if ( align[1] === "bottom" ) {
            arrow.top[0] = (src.outerHeight()/2) - (arrow_size[0]/2) - arrow.border;
            arrow.top[1] = arrow.top[0] + arrow.border;
        }
        arrow.left[0] -= dst_offset[0];
        arrow.left[1] -= dst_offset[0];
        arrow.top[0] -= dst_offset[1];
        arrow.top[1] -= dst_offset[1];

        arrow_stroke
            .css('top', arrow.top[0])
            .css('left', arrow.left[0])
            .css('border-top-width', arrow.stroke_border[0])
            .css('border-right-width', arrow.stroke_border[1])
            .css('border-bottom-width', arrow.stroke_border[2])
            .css('border-left-width', arrow.stroke_border[3])
            .css('border-top-color', arrow.stroke_colors[0])
            .css('border-right-color', arrow.stroke_colors[1])
            .css('border-bottom-color', arrow.stroke_colors[2])
            .css('border-left-color', arrow.stroke_colors[3]);

        arrow_fill
            .css('top', arrow.top[1])
            .css('left', arrow.left[1])
            .css('border-top-width', arrow.fill_border[0])
            .css('border-right-width', arrow.fill_border[1])
            .css('border-bottom-width', arrow.fill_border[2])
            .css('border-left-width', arrow.fill_border[3])
            .css('border-top-color', arrow.fill_colors[0])
            .css('border-right-color', arrow.fill_colors[1])
            .css('border-bottom-color', arrow.fill_colors[2])
            .css('border-left-color', arrow.fill_colors[3]);


    });

};

;let NKPosition = {};

let nkposition_event_listener = new NKEventListener();
NKPosition = { ...nkposition_event_listener };

NKPosition.start = function( dispatch_event = true ) {
    if ( NKPosition.loaded === true ) return;
    NKPosition.loaded = true;

    NKPosition.mouse = [0,0];

    window.addEventListener('mousemove', function (event) {
        NKPosition.mouse[0] = event.clientX;
        NKPosition.mouse[1] = event.clientY;
        if ( dispatch_event ) NKPosition.dispatchEvent('onMousemove', {
            abs: NKPosition.mouse,
            rel:  [ (NKPosition.mouse[0]).nksum(window.scrollX), (NKPosition.mouse[1]).nksum(window.scrollY) ]
        });
    }, true);

};


NKPosition.getMouse = function( absolute = false ) {
    return absolute ? NKPosition.mouse : [ (NKPosition.mouse[0]).nksum(window.scrollX), (NKPosition.mouse[1]).nksum(window.scrollY) ];
};

NKPosition.getMouseX = function( absolute = false) {
    return absolute ? NKPosition.mouse[0] : (NKPosition.mouse[0]).nksum(window.scrollX);
};

NKPosition.getMouseY = function( absolute = false ) {
    return absolute ? NKPosition.mouse[1] : (NKPosition.mouse[1]).nksum(window.scrollY);
};

NKPosition.getScroll = function() {
    return [window.scrollX, window.scrollY];
};

NKPosition.getScrollX = function() {
    return window.scrollX;
};

NKPosition.getScrollY = function() {
    return window.scrollY;
};
;class NKPromise {

    constructor() {
        let aux_resolve = null;
        let aux_reject = null;
        let p = new Promise((resolve, reject) => {
            aux_resolve = resolve;
            aux_reject = reject;
        });
        p.resolve = aux_resolve;
        p.reject = aux_reject;
        return p;
    }

};let NKResize = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before context_menu.js";
}

let nkresize_event_listener = new NKEventListener();
NKResize = { ...nkresize_event_listener };

NKResize.config = {
    column_resize_cursor: 'col-resize',
    row_resize_cursor: 'row-resize'
};



NKResize.start = function( reactable ) {
    if ( NKResize.loaded === true ) return;
    NKResize.loaded = true;

    if ( typeof NKDom === 'undefined' ) {
        throw "You must include NKDom.js";
    }
    if ( typeof NKPosition === 'undefined' ) {
        throw "You must include NKPosition.js";
    }
    NKPosition.start();

    window.addEventListener('load', NKResize.reload );
    if ( window.loaded === true ) NKResize.reload();

    if ( reactable === true ) {
        NK.core.reloadOnDomChange( NKResize );
    }

};

NKResize.reload = function() {

    let cols = NKDom.select(".NKResize_columns");
    let rows = NKDom.select(".NKResize_rows");

    cols.forEach(function( col, i ) {
        let sizes = [];

        let children = NKDom.getChildren(col, 'div');

        children.forEach(function ( child, j ) {
            NKDom.setAttribute( child, 'nk-i', j );
            NKDom.setCss( child, 'overflow', 'hidden' );

            let size = NKDom.getAttribute( child, 'nk-width' );
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        NKDom.setCss( col, 'display', 'grid' );
        NKDom.setCss( col, 'grid-template-columns', sizes.join(" ") );
        NKDom.setCss( col, 'overflow', 'hidden' );
    });

    rows.forEach(function( row, i ) {
        let sizes = [];

        let children = NKDom.getChildren(row, 'div');

        children.forEach(function ( child, j ) {
            NKDom.setAttribute( child, 'nk-i', j );
            NKDom.setCss( child, 'overflow', 'hidden' );

            let size = NKDom.getAttribute( child, 'nk-height' );
            size = NK.empty(size) ? "auto" : size;
            sizes.push( size );
        });

        NKDom.setCss( row, 'display', 'grid' );
        NKDom.setCss( row, 'grid-template-rows', sizes.join(" ") );
        NKDom.setCss( row, 'overflow', 'hidden' );
    });

    NKResize.resizing_vertical_element = null;
    NKResize.resizing_horizontal_element = null;

    function calculateSizes( parent, child, new_width, columns ) {
        let curr_colums = [];
        let new_columns = [];
        let col_i = parseInt( NKDom.getAttribute(child, 'nk-i') );

        if ( columns ) {
            curr_colums = NKDom.getCss(parent, 'grid-template-columns').split(" ");
        } else {
            curr_colums = NKDom.getCss(parent, 'grid-template-rows').split(" ");
        }

        if ( col_i === curr_colums.length-1 ) return curr_colums.join(" ");

        for ( let i = 0; i < curr_colums.length; i++ ) {
            if ( i === col_i ) {
                new_columns.push( new_width + "px" );

            } else if ( i === col_i + 1 ) {
                new_columns.push("auto");

            } else {
                new_columns.push( curr_colums[i] );

            }
        }

        return new_columns;
    }


    function onMouse( e ) {
        let col_pos = this.getBoundingClientRect();
        let column_pos = [col_pos.left, col_pos.top];
        let mouse_pos = NKPosition.getMouse();
        let diff_pos = [mouse_pos[0]-column_pos[0], mouse_pos[1]-column_pos[1]];
        //let div_size = [this.offsetWidth, this.offsetHeight];
        let div_size = [this.clientWidth, this.clientHeight];
        let in_vertical_border = (diff_pos[0] >= (div_size[0]-5));
        let in_horizontal_border = (diff_pos[1] >= (div_size[1]-5));
        let is_last_child = (this === this.parentNode.lastElementChild);
        let action = e.type;

        if ( action === 'mousedown' ) {
            if ( in_vertical_border && !is_last_child ) {
                NKResize.resizing_vertical_element = this;
                NKResize.start_columns = NKDom.getCss( this.parentNode, 'grid-template-columns' ).split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
                NKDom.addClass( NKDom.getChildren(NKDom.getChildren('.NKResize_columns', 'div')), "NKResize_disable_temp" );
            }
            if ( in_horizontal_border && !is_last_child ) {
                NKResize.resizing_horizontal_element = this;
                NKResize.start_rows = NKDom.getCss( this.parentNode, 'grid-template-rows' ).split(" ");
                NKResize.start_pos = mouse_pos;
                NKResize.start_size = div_size;
                NKDom.addClass( NKDom.getChildren(NKDom.getChildren('.NKResize_rows', 'div')), "NKResize_disable_temp" );
            }


        } else if ( action === 'mousemove' ) {
            let r_v_e = NKResize.resizing_vertical_element;
            let r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                let parent = r_v_e.parentNode;
                let border_right = parseInt( NKDom.getCss(r_v_e, "border-right-width") );
                let new_width = NKResize.start_size[0] + (mouse_pos[0] - NKResize.start_pos[0]) + border_right;
                let new_sizes = calculateSizes(parent, r_v_e, new_width, true);

                NKDom.setCss( parent, 'grid-template-columns', new_sizes.join(" ") );

                NKDom.getChildren(parent, 'div').forEach(function (child, i) {
                    NKDom.setAttribute( child, 'nk-width', new_sizes[i] );
                });

                NKDom.setCss( this, 'cursor', NKResize.config.column_resize_cursor );

            } else if ( r_h_e !== null ) {
                let parent = r_h_e.parentNode;
                let border_bottom = parseInt( NKDom.getCss(r_h_e, "border-bottom-width") );
                let new_height = NKResize.start_size[1] + (mouse_pos[1] - NKResize.start_pos[1]) + border_bottom;
                let new_sizes = calculateSizes(parent, r_h_e, new_height, false);

                NKDom.setCss( parent, 'grid-template-rows', new_sizes.join(" ") );

                NKDom.getChildren(parent, 'div').forEach(function (child, i) {
                    NKDom.setAttribute( child, 'nk-height', new_sizes[i] );
                });

                NKDom.setCss( this, 'cursor', NKResize.config.row_resize_cursor );

            } else {
                if ( in_vertical_border && !is_last_child && NKDom.hasClass( this.parentNode, 'NKResize_columns' ) ) {
                    NKDom.setCss( this, 'cursor', NKResize.config.column_resize_cursor );

                } else  if ( in_horizontal_border && !is_last_child && NKDom.hasClass( this.parentNode, 'NKResize_rows' ) ) {
                    NKDom.setCss( this, 'cursor', NKResize.config.row_resize_cursor );

                } else {
                    NKDom.setCss( this, 'cursor', '' );

                }

            }

        } else if ( action === 'mouseup' ) {
            let r_v_e = NKResize.resizing_vertical_element;
            let r_h_e = NKResize.resizing_horizontal_element;

            if ( r_v_e !== null ) {
                let sizes = NKDom.getCss( r_v_e.parentNode, 'grid-template-columns' ).split(" ");
                let col_i = parseInt( NKDom.getAttribute(r_v_e, 'nk-i') );
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_columns,
                    end: sizes,
                    i: col_i,
                    e: r_v_e,
                    parent: r_v_e.parentNode
                });
                NKDom.removeClass( NKDom.getChildren(NKDom.getChildren('.NKResize_columns', 'div')), "NKResize_disable_temp" );
            }
            if ( r_h_e !== null ) {
                let sizes = NKDom.getCss( r_h_e.parentNode, 'grid-template-rows' ).split(" ");
                let col_i = parseInt( NKDom.getAttribute(r_h_e, 'nk-i') );
                NKResize.dispatchEvent('onResize', {
                    start: NKResize.start_rows,
                    end: sizes,
                    i: col_i,
                    e: r_h_e,
                    parent: r_h_e.parentNode
                });
                NKDom.removeClass( NKDom.getChildren(NKDom.getChildren('.NKResize_rows', 'div')), "NKResize_disable_temp" );
            }

            NKResize.resizing_vertical_element = null;
            NKResize.resizing_horizontal_element = null;
            NKDom.setCss( this, 'cursor', '' );

        }

    }


    function onMouseLeaveColumns() {
        NKResize.resizing_vertical_element = null;
        NKDom.setCss( this, 'cursor', '' );
    }
    function onMouseLeaveRows() {
        NKResize.resizing_horizontal_element = null;
        NKDom.setCss( this, 'cursor', '' );
    }

    NKDom.addEventListener('.NKResize_columns', 'mouseleave', onMouseLeaveColumns);
    NKDom.addEventListener('.NKResize_rows', 'mouseleave', onMouseLeaveRows);

    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mousemove', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mousedown', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_columns', 'div' ), 'mouseup', onMouse);

    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mousemove', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mousedown', onMouse);
    NKDom.addEventListener(NKDom.getChildren( '.NKResize_rows', 'div' ), 'mouseup', onMouse);
};


;var NKRouting = {
    routes: []
};


NKRouting.get_url = function() {
    return [
        window.location.protocol + "//",
        window.location.host,
        window.location.pathname.split('/').slice(0, -1).join('/') + "/",
        window.location.pathname.split('/').pop(),
        window.location.search
    ];
};

NKRouting.set_routes = function( routes ) {
    NKRouting.routes[ routes.router_name ] = routes;

    if ( NK.isset(routes.default_section) ) {
        $(document).ready(function(){
            NKRouting.go( routes.router_name, routes.default_section );
        });
    }
};


NKRouting.go = function( router_name, section ) {

    if ( !NK.isset(NKRouting.routes[router_name]) ) {
        console.error( "Routes for", router_name, "not set.");
        return;
    }

    var ruta = NKRouting.routes[router_name].sections[section];

    if ( !NK.isset(ruta) ) {
        console.error( "Routes for", router_name, "->", section, "not set.");
        return;
    }

    
    if ( NK.isset(ruta.get) ) {
        NKRouting._perform_get( router_name, section );

    } else if ( NK.isset(ruta.show) ) {
        NKRouting._perform_show( router_name, section );

    }

    
    

};


NKRouting._perform_show = function( router_name, section ) {

    var container = NKRouting.routes[router_name].container;
    var sections = NKRouting.routes[router_name].sections;

    if ( !NK.isset(container) ) {
        for ( var auxSection in sections ) {
            $(sections[auxSection].show).hide();
        }

        $(sections[section].show).show();
    } else {
        
        if ( !NK.isset(sections[section].content) ) {
            for ( var auxSection in sections ) {
                sections[auxSection].content = $(sections[auxSection].show).html();
                $(sections[auxSection].show).html("");
            }
        }

        NKRouting._replace_content( router_name, section );

    }

    NKRouting._run_controller( router_name, section );
    

};


NKRouting._perform_get = function( router_name, section ) {

    var sectionObj = NKRouting.routes[router_name].sections[section];

    if ( NK.isset(sectionObj.loading) ) return;

    if ( !NK.isset(sectionObj.content) ) {
        sectionObj.loading = true;

        $.ajax({
            url: sectionObj.get, 
            success: function ( result ) {
                sectionObj.content = result;
                NKRouting._replace_content( router_name, section );
                delete sectionObj.loading;
                NKRouting._run_controller( router_name, section );
            }
        });           
            
    } else {

        NKRouting._replace_content( router_name, section );
        NKRouting._run_controller( router_name, section );
    }

}



NKRouting._replace_content = function( router_name, section ) {

    var container = NKRouting.routes[router_name].container;
    var content = NKRouting.routes[router_name].sections[section].content;
    var controller = NKRouting.routes[router_name].sections[section].ctrl;

    $(container).html( content );

};


NKRouting._run_controller = function( router_name, section ) {
    var router = NKRouting.routes[router_name];
    var ruta = NKRouting.routes[router_name].sections[section];
    var controller_init = ruta.ctrl + ".init";
    var controller_enter = ruta.ctrl + ".enter";

    if ( NK.isset(router.last_section) ) {
        var last_controller = NKRouting.routes[router_name].sections[router.last_section].ctrl;
        if ( NK.isset(last_controller) ) {
            if ( eval('typeof ' + last_controller + ".leave") === 'function' ) {
                eval( last_controller + ".leave()" );
            }
        }
    }
    router.last_section = section;

    if ( !NK.isset(ruta.ctrl) ) return;

    var first_time = !NK.isset( ruta.loaded );
    ruta.loaded = true;

    if ( first_time ) {
        if ( eval('typeof ' + controller_init) === 'function' ) {
            eval( controller_init + "()" );
        }
    }

    if ( eval('typeof ' + controller_enter) === 'function' ) {
        eval( controller_enter + "()" );
    }
    
};


;
class NKSemaphore {
    constructor( initialCount ) {
        this.max = initialCount;
        this.count = initialCount;
        this.waitingQueue = [];
        this.waitingEmptyQueue = [];
    }

    async acquire() {
        if (this.count > 0) {
            this.count--;
        } else {
            await new Promise(resolve => this.waitingQueue.push(resolve));
        }
    }

    async wait() {
        if ( this.count !== this.max ) {
            await new Promise(resolve => this.waitingEmptyQueue.push(resolve));
        }
    }

    release() {
        if (this.waitingQueue.length > 0) {
            const resolve = this.waitingQueue.shift();
            resolve();
        } else if ( this.count < this.max ) {
            this.count++;
        }

        if ( this.count === this.max ) {
            while ( this.waitingEmptyQueue.length > 0 ) {
                const resolve = this.waitingEmptyQueue.shift();
                resolve();
            }
        }
    }
};let NKSerialize = { debug: false };
let NKUnserialize = {};


NKSerialize.number_types = {
    integer_positive: 0,
    integer_negative: 1,
    float_positive: 2,
    float_negative: 3
}

NKSerialize.types = {
    null: 4,
    undefined: 5,
    number: 6,
    number_array: 7,
    string: 8,
    string_array: 9,
    boolean: 10,
    object: 11,
    object_array: 12,
    sub_object: 13,
    mix_array: 14
}



// NKSerialize
// Al principio siempre añadimos la longitud
// Añadimos la opción set_type = false
// Devolvemos directamente en formato string

// NKUnserialize
// Devolvemos siempre {value: "", len: 0}


NKSerialize.integer = function ( num ) {
    if (num < 0) throw new Error("El número debe ser positivo.");

    if ( NKSerialize.debug ) console.log("Src num: ", num);
    let sbin = num.toString(2);

    if ( NKSerialize.debug ) console.log("Src num bin: ", sbin);
    let len = Math.ceil(sbin.length / 15) * 15;
    sbin = sbin.padStart( len, '0' );

    let result = [];

    for ( let i = 0; i < sbin.length; i += 15 ) result.push("0" + sbin.substring(i, i + 15));
    result[result.length-1] = "1" + result[result.length-1].slice(1);


    if ( NKSerialize.debug ) console.log("Src num bin splitted: ", result);

    let sresult = "";
    for ( let i = 0; i < result.length; i++ ) {
        result[i] = parseInt(result[i], 2);
        sresult += String.fromCharCode(result[i]);
    }

    return sresult;
}


NKUnserialize.integer = function ( encoded ) {

    let result = "";
    let aux = [];
    let i = 0;

    for ( i = 0; i < encoded.length; i++ ) {
        let bin = encoded[i].charCodeAt(0).toString(2).padStart(16, '0');
        aux.push(bin);
        result += bin.slice(-15);

        if ( bin[0] === "1" ) break;
    }

    if ( NKSerialize.debug ) console.log("Dst num bin splitted: ", aux);
    if ( NKSerialize.debug ) console.log("Dst num bin: ", result);

    result = parseInt(result, 2);

    if ( NKSerialize.debug ) console.log("Dst num: ", result);

    return {value: result, len: i+1};
}


NKSerialize.boolean = function ( value, set_type = false ) {
    let int_val = value ? 1 : 0;

    if ( !set_type ) return NKSerialize.integer(int_val);
    return NKSerialize.integer( NKSerialize.types.boolean ) + NKSerialize.integer(int_val);

}

NKUnserialize.boolean = function ( serialized_string ) {

    let int_val = NKUnserialize.integer( serialized_string );
    return {value: (int_val.value !== 0), len: int_val.len };

}

NKSerialize.string = function ( str, set_type = false ) {

    if ( !set_type ) return NKSerialize.integer(str.length) + str;
    return NKSerialize.integer( NKSerialize.types.string ) + NKSerialize.integer(str.length) + str;

}

NKUnserialize.string = function ( serialized_string ) {

    let str_len = NKUnserialize.integer( serialized_string );
    return {value: serialized_string.slice(str_len.len, str_len.len + str_len.value), len: str_len.len+str_len.value };

}

//Si serializamos un array suelto (structures=null), si hay objetos, se guarda en forma 'object' (cada uno con su listado de keys)
//Si serializamos un array dentro de un objeto, si hay objetos seran tipo sub_object, y guardamos en structures.
NKSerialize.array = function ( array, structures = null, set_type = false ) {
    let first_type = NKObject.getTypeName( array[0] );
    let all_same_type = array.every(e => NKObject.getTypeName(e) === first_type);

    let type = NKSerialize.types.mix_array;
    if ( all_same_type && array.length > 0 ) {
        if ( first_type === "string" ) type = NKSerialize.types.string_array;
        else if ( first_type === "number" ) type = NKSerialize.types.number_array;
        else if ( first_type === "object" ) type = NKSerialize.types.object_array;
        else console.error("Error, unknown type:", array[0], first_type);
    }

    let set_each_element_type = (type === NKSerialize.types.mix_array);

    let result = "";
    if ( set_type ) result += NKSerialize.integer(type);
    result += NKSerialize.integer(array.length);


    //Si no son todos del mismo tipo, le indicamos set_type
    for ( let i = 0; i < array.length; i++ ) {
        if ( NKObject.isType(array[i],"object") && (structures === null) ) {
            result += NKSerialize.object( array[i], set_each_element_type );
        } else {
            result += NKSerialize.byType( array[i], set_each_element_type, structures );
        }

    }

    return result;
}

//Contiene set_type delante de cada elemento
NKUnserialize.mixArray = function ( serialized_array, structures ) {
    let result = [];

    let index = 0;
    let i = 0;

    let array_len = NKUnserialize.integer(serialized_array);
    index += array_len.len;

    while ( i++ < array_len.value ) {
        let value = NKUnserialize.byType( serialized_array.slice(index), structures );
        result.push( value.value );
        index += value.len;
    }

    return {value: result, len: index};
}

//Si structures=null, significa que es un array de objetos simple, donde cada objeto tiene sus estructuras dentro
NKUnserialize.objectArray = function ( serialized_array, structures = null ) {
    let result = [];

    let index = 0;
    let i = 0;

    let array_len = NKUnserialize.integer(serialized_array);
    index += array_len.len;

    while ( i++ < array_len.value ) {
        let value = null;
        if ( structures === null ) {
            value = NKUnserialize.object( serialized_array.slice(index) );
        } else {
            value = NKUnserialize.sub_object( serialized_array.slice(index), structures );
        }

        result.push( value.value );
        index += value.len;
    }

    return {value: result, len: index};
}

NKSerialize.stringArray = function ( string_array, set_type = false ) {
    return NKSerialize.array(string_array, null, set_type);
}

NKUnserialize.stringArray = function ( serialized_string_array ) {
    let result = [];

    let index = 0;
    let i = 0;

    let array_len = NKUnserialize.integer(serialized_string_array);
    index += array_len.len;

    while ( i++ < array_len.value ) {
        let str = NKUnserialize.string( serialized_string_array.slice(index) );
        result.push( str.value );
        index += str.len;
    }

    return {value: result, len: index};
}




NKSerialize.number = function ( num, set_type = false ) {
    if ( num === NaN || num === Infinity || num === -Infinity ) num = 0;

    if ( isNaN(num) )  {
        console.error("Error, value (", num, ") is not a number.");
        num = 0;
    }

    let result = "";

    //1 (0001): positive int (integer)
    //2 (0010): negative int (integer)
    //3 (0011): positive float (two integers)
    //4 (0100): negative float (two integers)

    if ( Number.isInteger(num) ) {
        if ( num >= 0 ) result = NKSerialize.integer( NKSerialize.number_types.integer_positive ) + NKSerialize.integer(num);
        else result = NKSerialize.integer(NKSerialize.number_types.integer_negative) + NKSerialize.integer(-num);
    } else {
        let parts = (num+"").split(".");
        parts[0] = parseInt(parts[0]);
        parts[1] = parseInt(parts[1]);

        if ( num >= 0 ) result = NKSerialize.integer(NKSerialize.number_types.float_positive) + NKSerialize.integer(parts[0]) + NKSerialize.integer(parts[1]);
        else result = NKSerialize.integer(NKSerialize.number_types.float_negative) + NKSerialize.integer(-parts[0]) + NKSerialize.integer(parts[1]);
    }

    if ( set_type ) result = NKSerialize.integer( NKSerialize.types.number ) + result;

    return result;
}

NKUnserialize.number = function ( serialized_num ) {
    let type = NKUnserialize.integer(serialized_num);
    serialized_num = serialized_num.slice(type.len);

    let part1 = NKUnserialize.integer(serialized_num);

    if ( type.value === NKSerialize.number_types.integer_positive ) return {value: part1.value, len: type.len+part1.len};
    if ( type.value === NKSerialize.number_types.integer_negative ) return {value:-part1.value, len: type.len+part1.len};

    serialized_num = serialized_num.slice(part1.len);

    let part2 = NKUnserialize.integer(serialized_num);

    let float_num = parseFloat(part1.value + "." + part2.value );

    if ( type.value === NKSerialize.number_types.float_positive ) return {value: float_num, len: type.len+part1.len+part2.len};
    if ( type.value === NKSerialize.number_types.float_negative ) return {value: -float_num, len: type.len+part1.len+part2.len};

}

NKSerialize.numberArray = function ( number_array, set_type = false ) {
    return NKSerialize.array(number_array, null, set_type);
}

NKUnserialize.numberArray = function ( serialized_number_array ) {
    let result = [];

    let index = 0;
    let i = 0;

    let array_len = NKUnserialize.integer(serialized_number_array);
    index += array_len.len;

    while ( i++ < array_len.value ) {
        let num = NKUnserialize.number( serialized_number_array.slice(index) );
        result.push( num.value );
        index += num.len;
    }

    return {value: result, len: index};
}


NKSerialize.byType = function ( value, set_type, structures = [] ) {
    if ( NKObject.isType(value,"undefined")) return set_type ? NKSerialize.integer( NKSerialize.types.undefined ) : '';
    if ( NKObject.isType(value,"string")   ) return NKSerialize.string( value, set_type );
    if ( NKObject.isType(value,"number")   ) return NKSerialize.number( value, set_type );
    if ( NKObject.isType(value,"boolean")  ) return NKSerialize.boolean( value, set_type );
    if ( NKObject.isType(value,"array")    ) return NKSerialize.array( value, structures, set_type );
    if ( NKObject.isType(value,"null")     ) return set_type ? NKSerialize.integer( NKSerialize.types.null ) : ''; //typeof null = 'object'
    if ( NKObject.isType(value,"object")   ) return NKSerialize.sub_object( value, structures, set_type );

    return NKSerialize.string( "Not implemented (Unknown type)", value );
}




NKSerialize.sub_object = function ( obj, structures = [], set_type = false ) {
    let result = "";

    let keys = Object.keys(obj);
    keys.sort();
    let curr_structure = NKSerialize.stringArray( keys );

    let structure_index = structures.indexOf(curr_structure);

    if ( structure_index === -1 ) {
        structures.push(curr_structure);
        structure_index = structures.length - 1;
    }

    if ( set_type ) result += NKSerialize.integer( NKSerialize.types.sub_object );
    result += NKSerialize.integer( structure_index );


    let values = []; //Same order than Object.keys
    for ( let i = 0; i < keys.length; i++ ) values.push(obj[keys[i]]);



    for ( let i = 0; i < values.length; i++ ) {
        values[i] = NKSerialize.byType( values[i], true, structures );

    }

    result += values.join('');

    return result;
}

NKSerialize.object = function ( obj, set_type = false ) {
    let structures = [];

    let serialized_obj = NKSerialize.sub_object( obj, structures );

    let result = "";
    if ( set_type ) result += NKSerialize.integer( NKSerialize.types.object );
    result += NKSerialize.integer( structures.length );
    result += structures.join('');

    result += serialized_obj;

    return result;
}

NKUnserialize.byType = function ( serialized_obj, structures = [] ) {
    let type = NKUnserialize.integer(serialized_obj);
    let content = {value: null, len: null};

    if ( [NKSerialize.types.number].includes(type.value) ) {
        content = NKUnserialize.number(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.boolean ) {
        content = NKUnserialize.boolean(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.string ) {
        content = NKUnserialize.string(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.string_array ) {
        content = NKUnserialize.stringArray(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.number_array ) {
        content = NKUnserialize.numberArray(serialized_obj.slice(type.len));

    } else if ( type.value === NKSerialize.types.sub_object ) {
        content = NKUnserialize.sub_object(serialized_obj.slice(type.len), structures);

    } else if ( type.value === NKSerialize.types.object_array ) {
        content = NKUnserialize.objectArray(serialized_obj.slice(type.len), structures);

    } else if ( type.value === NKSerialize.types.mix_array ) {
        content = NKUnserialize.mixArray(serialized_obj.slice(type.len), structures);

    } else if ( type.value === NKSerialize.types.null ) {
        content = {value: null, len: 0};

    } else if ( type.value === NKSerialize.types.undefined ) {
        content = {value: undefined, len: 0};

    } else {
        console.error("Unknown type " + type.value);
    }

    return {type: type.value, value: content.value, len: type.len+content.len};
}

NKUnserialize.sub_object = function ( serialized_obj, structures ) {
    let index = 0;

    let structure_index = NKUnserialize.integer( serialized_obj.slice(index) );
    index += structure_index.len;

    let keys = structures[ structure_index.value ];

    let result = {};

    for ( let i = 0; i < keys.length; i++ ) {
        let key = keys[i];
        let value = NKUnserialize.byType( serialized_obj.slice(index), structures );

        result[key] = value.value;
        index += value.len;
    }

    return {value: result, len: index};
}

NKUnserialize.object = function ( serialized_obj ) {
    let index = 0;

    let structures_len = NKUnserialize.integer(serialized_obj);
    index += structures_len.len;

    let structures = [];
    for ( let i = 0; i < structures_len.value; i++ ) {

        let structure = NKUnserialize.stringArray( serialized_obj.slice(index) );
        index += structure.len;

        structures.push(structure.value);
    }


    let result = NKUnserialize.sub_object( serialized_obj.slice(index), structures );

    return {value: result.value, len: result.len + index};
}



;let NKStick = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before stick.js";
}

// TODO Same functions but with nkdata-container="theContainer"

NKStick.start = function() {
    if ( NK.isset(NKStick.loaded) && NKStick.loaded === true ) return;


    NKDom.select('.NKStickBD').forEach(function ( el, i ){
        NKDom.setAttribute( el, 'nkdata-top', el.offsetTop )
    });


    window.addEventListener('load', NKStick.reload );
    window.addEventListener('resize', NKStick.reload );
    window.addEventListener('scroll',  NKStick.reload );

    NKStick.loaded = true;
};

NKStick.reload = function() {

    let scroll_visible = document.documentElement.scrollHeight > window.innerHeight;
    let scroll_top = document.documentElement.scrollTop;

    // NKStickBN
    if ( scroll_visible ) {
        NKDom.removeClass('.NKStickBN', 'NKStickBO');
    } else {
        NKDom.addClass('.NKStickBN', 'NKStickBO');
    }

    if ( !scroll_visible ) return;

    // NKStickBD
    NKDom.removeClass('.NKStickBD', 'NKStickBO');

    NKDom.select('.NKStickBD').forEach(function (el, i){
        if ( scroll_top + window.innerHeight < el.offsetTop + el.clientHeight ) {
            NKDom.addClass('.NKStickBD', 'NKStickBO');
        }
    });


    // NKStickTD
    NKDom.removeClass('.NKStickTD', 'NKStickTO');

    NKDom.select('.NKStickTD').forEach(function (el, i){
        if ( NKDom.getCss(el, 'position') === "fixed" ) {
            let top = parseInt( NKDom.getCss(el, 'top') );

            if ( scroll_top < top ) {
                NKDom.setCss(el, 'margin-top', -scroll_top);
            } else {
                NKDom.setCss(el, 'margin-top', -top);
            }

        } else {
            if ( scroll_top > el.offsetTop ) {
                NKDom.addClass('.NKStickTD', 'NKStickTO');
            }

        }
    });


};
;var NKStorage = {};

if ( typeof NK === 'undefined' ) {
    throw "You must include base.js before storage.js";
}

var nkstorage_event_listener = new NKEventListener();
NKStorage = { ...nkstorage_event_listener };

NKStorage.p = null;
NKStorage.np = null;


NKStorage.save = function( force ) {
    if ( force === true || NKStorage.is_safari ) {
        localStorage.setItem( 'NKStorage', JSON.stringify(NKStorage.p) );
        sessionStorage.setItem( 'NKStorage', JSON.stringify(NKStorage.np) );
        NKStorage.saveOnLeave = false;
    } else {
        NKStorage.saveOnLeave = true;
    }
};


NKStorage.start = function( save_on_leave = true ) {
    NKStorage.saveOnLeave = save_on_leave;

    if ( NK.isset(NKStorage.loaded) && NKStorage.loaded === true ) return;

    NKStorage.is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    try {
        NKStorage.p = JSON.parse( localStorage.getItem('NKStorage') );
    } catch (e) {}

    if ( !NK.isset(NKStorage.p) ) {
        localStorage.setItem( 'NKStorage', JSON.stringify({}) );
        NKStorage.p = JSON.parse('{}');
    }

    try {
        NKStorage.np = JSON.parse( sessionStorage.getItem('NKStorage') );
    } catch (e) {}

    if ( !NK.isset(NKStorage.np) ) {
        sessionStorage.setItem( 'NKStorage', JSON.stringify({}) );
        NKStorage.np = JSON.parse('{}');
    }

    NKStorage.loaded = true;
};

NKStorage.clear = function() {
    localStorage.setItem( 'NKStorage', JSON.stringify({}) );
    NKStorage.p = JSON.parse('{}');
    sessionStorage.setItem( 'NKStorage', JSON.stringify({}) );
    NKStorage.np = JSON.parse('{}');
};

NKStorage.broadcast = function ( path ) {
    var path_parts = path.split(".");
    var path_aux = [];
    for ( var i in path_parts ) {
        path_aux.push( path_parts[i] );
        NKStorage.dispatchEvent( path_aux.join(".") );
    }
}

NKStorage.listen = function ( path, cbk ) {
    NKStorage.addEventListener( path, cbk );
}


// On page leave
NKStorage.oldLeaveHandler = window.onbeforeunload;
window.onbeforeunload = function (e) {
    if (NKStorage.oldLeaveHandler) NKStorage.oldLeaveHandler(e);

    if ( NKStorage.saveOnLeave === true) {
        NKStorage.save( true );
    }
};

;let NKString = {};

// hello world -> Hello world
NKString.capitalize = function ( str ) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

String.prototype.nkcapitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};



NKString.normalizeSpaces = function ( str ) {
    return str.replace(/\s+/g, ' ').trim();
}

String.prototype.nknormalizeSpaces = function() {
    return this.replace(/\s+/g, ' ').trim();
};


NKString.deleteAllSpaces = function ( str ) {
    return str.replace(/\s+/g, '');
}

String.prototype.deleteAllSpaces = function() {
    return this.replace(/\s+/g, '');
};

NKString.htmlEntities = {
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Ntilde;': 'Ñ',
    '&Uuml;': 'Ü',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&ntilde;': 'ñ',
    '&uuml;': 'ü',
    '&nbsp;': ' ',
    '&iexcl;': '¡',
    '&iquest;': '¿',
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&apos;': "'",
    '&#37;': '%',
    '&reg;': '®',
    '&deg;': 'ª',
    '&micro;': 'µ'
};

NKString.decodeHtmlEntities = function ( str ) {
    try {
        return str.replace(/&[a-zA-Z0-9#]+;/g, match => NKString.htmlEntities[match] || match);
    } catch (e) {}
    return str;
}

String.prototype.decodeHtmlEntities = function() {
    try {
        return this.replace(/&[a-zA-Z0-9#]+;/g, match => NKString.htmlEntities[match] || match);
    } catch (e) {}
    return this;
};;let NKVar = {};

NKVar.isset = function( variable ) {
        if ( typeof variable === 'undefined' ) return false;
        if ( variable == null ) return false;
        if ( typeof variable === 'function' ) {
            try {
                variable();
            } catch (e) {
                return false;
            }
        }

        return true;
};

NKVar.empty = function( variable ) {
    if ( !NK.isset(variable) ) return true;
    if ( typeof variable === 'function' ) variable = variable();
    if ( variable.length === 0 ) return true;
    return false;
};


;

var NKWebsocketClient = function ( host, port ) {
    this.host = host;
    this.port = port;
    this.socket = null;
    this.writePromises = {};

    this.connect = function () {
        let self = this;

        this.socket = new WebSocket('ws://' + this.host + ":" + this.port );

        this.socket.addEventListener('open', (event) => this.onOpen(event) );
        this.socket.addEventListener('close', (event) => this.onClose(event) );
        this.socket.addEventListener('error', (event) => this.onError(event) );
        this.socket.addEventListener('message', (event) => {
            let data = event.data.toString();
            let num_cli = data.charCodeAt(0);
            let num_serv = data.charCodeAt(1);
            data = data.substring(2);


            if ( num_cli === 0 ) {
                var sendResponse = function ( msg ) {
                    self.socket.send( String.fromCharCode(num_cli) + String.fromCharCode(num_serv) + msg );
                }

                this.onMessage( data, sendResponse, event );
            } else {
                this.writePromises[num_cli](data);
                delete this.writePromises[num_cli];
            }

        } );
    }

    this.connected = function () {
        return (this.socket.readyState !== WebSocket.CLOSED);
    }

    this.reconnect = async function () {
        while ( !this.connected() ) {
            this.connect();
            await NK.sleep(5000);
        }
    }

    this.write = function ( msg ) {
        this.socket.send( String.fromCharCode(0) + String.fromCharCode(0) + msg );
    }

    this.writeAndWait = function ( msg, timeout_ms ) {
        let self = this;
        let num_cli = 0;
        let num_serv = 0;

        for ( let i = 1; i < 255; i++ ) {
            if ( this.writePromises[i] === undefined ) {
                num_cli = i;
                break;
            }
        }

        if ( num_cli === 0 ) {
            return new Promise(function(resolve, reject) {
                reject( "Error, too many writeAndWait" );
            });
        }

        let p = new Promise(function(resolve, reject) {
            self.writePromises[num_cli] = resolve;
            setTimeout( function() { reject( "Timeout" ); }, timeout_ms);
        });

        this.socket.send( String.fromCharCode(num_cli) + String.fromCharCode(num_serv) + msg );

        return p;
    }

    this.onOpen = function ( e ) {};
    this.onMessage = function ( data, sendResponse, e ) {};
    this.onClose = function ( e ) {};
    this.onError = function ( e ) {};
}