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
  } else {
    GLOBAL.Big = Big;
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

;let candle_data = [
[1728000000000,2349.80000000,2350.75000000,2348.65000000,2350.75000000,254.91730000,1728000059999,599064.30384600,2740,30.55970000,71809.84676600,0],
[1728000060000,2350.74000000,2351.40000000,2349.90000000,2350.15000000,65.29960000,1728000119999,153492.46879200,2162,49.54820000,116466.11927900,0],
[1728000120000,2350.15000000,2351.64000000,2347.39000000,2350.31000000,114.06050000,1728000179999,268021.26303100,3734,48.97460000,115078.45443900,0],
[1728000180000,2350.30000000,2352.60000000,2350.00000000,2352.30000000,61.22490000,1728000239999,143981.31061300,1944,42.69550000,100408.18742600,0],
[1728000240000,2352.30000000,2352.83000000,2350.90000000,2351.12000000,85.43000000,1728000299999,200935.50789400,1752,35.07880000,82495.99244400,0],
[1728000300000,2351.11000000,2351.80000000,2349.16000000,2351.79000000,194.50590000,1728000359999,457248.10902700,2528,83.37920000,196005.64872800,0],
[1728000360000,2351.80000000,2352.60000000,2350.26000000,2350.26000000,215.43550000,1728000419999,506567.28478700,2046,60.96440000,143303.68310500,0],
[1728000420000,2350.26000000,2350.26000000,2347.29000000,2347.29000000,96.03350000,1728000479999,225519.76387500,2000,20.19430000,47415.24462600,0],
[1728000480000,2347.29000000,2347.45000000,2346.16000000,2346.67000000,67.57610000,1728000539999,158589.90164900,2323,21.87790000,51344.17040700,0],
[1728000540000,2346.66000000,2349.47000000,2344.71000000,2349.05000000,251.14260000,1728000599999,589408.81890400,3960,148.78240000,349209.49611800,0],
[1728000600000,2349.05000000,2352.08000000,2348.81000000,2349.65000000,141.46780000,1728000659999,332545.23961100,4748,74.98650000,176269.30437500,0],
[1728000660000,2349.64000000,2349.64000000,2347.62000000,2348.26000000,73.76560000,1728000719999,173238.36240900,3559,31.22520000,73329.42544700,0],
[1728000720000,2348.26000000,2348.90000000,2347.31000000,2347.57000000,44.13580000,1728000779999,103645.44769600,1556,18.13970000,42601.17283600,0],
[1728000780000,2347.57000000,2347.57000000,2345.50000000,2347.00000000,61.46270000,1728000839999,144218.60628800,1655,36.01670000,84508.25128700,0],
[1728000840000,2347.01000000,2347.27000000,2346.14000000,2346.45000000,53.70410000,1728000899999,126033.31561200,672,34.76910000,81595.78204200,0],
[1728000900000,2346.41000000,2346.41000000,2344.00000000,2344.64000000,331.23230000,1728000959999,776851.88523700,1811,179.03730000,419929.80298300,0],
[1728000960000,2344.65000000,2345.60000000,2343.43000000,2345.30000000,135.70230000,1728001019999,318154.33229500,1479,46.42660000,108853.34361100,0],
[1728001020000,2345.30000000,2349.60000000,2345.17000000,2349.19000000,156.89760000,1728001079999,368392.49218100,2523,47.38540000,111248.84043700,0],
[1728001080000,2349.19000000,2350.00000000,2347.74000000,2348.15000000,142.47420000,1728001139999,334682.68166900,1681,52.84440000,124135.06326800,0],
[1728001140000,2348.14000000,2348.99000000,2346.84000000,2346.90000000,38.84550000,1728001199999,91205.95758900,1422,15.29270000,35904.38661500,0],
[1728001200000,2346.90000000,2347.07000000,2344.24000000,2346.20000000,68.52830000,1728001259999,160730.47907900,1009,35.80980000,83986.78492200,0],
[1728001260000,2346.20000000,2347.14000000,2345.65000000,2346.19000000,65.08460000,1728001319999,152705.91149500,1069,27.33020000,64123.18760400,0],
[1728001320000,2346.20000000,2348.00000000,2343.01000000,2345.91000000,105.12310000,1728001379999,246584.07881400,2012,48.18520000,113019.23902500,0],
[1728001380000,2345.92000000,2346.25000000,2344.70000000,2345.26000000,82.64530000,1728001439999,193847.95814700,1220,58.85540000,138046.17805200,0],
[1728001440000,2345.25000000,2346.06000000,2344.47000000,2345.53000000,65.87250000,1728001499999,154496.60017500,1760,39.18580000,91904.03464000,0],
[1728001500000,2345.57000000,2346.20000000,2344.03000000,2344.96000000,98.64940000,1728001559999,231362.78108700,1352,54.82260000,128573.37203000,0],
[1728001560000,2344.97000000,2345.93000000,2344.20000000,2345.00000000,76.68160000,1728001619999,179812.64903000,1427,46.77140000,109675.62750200,0],
[1728001620000,2344.99000000,2345.60000000,2341.64000000,2342.99000000,179.09870000,1728001679999,419819.58235300,2305,65.90010000,154462.24439800,0],
[1728001680000,2343.00000000,2347.20000000,2343.00000000,2347.02000000,342.08410000,1728001739999,802176.26109900,1877,273.81070000,642139.31036300,0],
[1728001740000,2347.03000000,2349.80000000,2346.89000000,2347.71000000,92.95160000,1728001799999,218311.60179600,1761,52.67540000,123716.54974600,0],
[1728001800000,2347.72000000,2348.15000000,2345.45000000,2346.59000000,114.37410000,1728001859999,268352.31108000,3536,76.37930000,179188.41384100,0],
[1728001860000,2346.59000000,2350.92000000,2346.59000000,2349.10000000,168.01760000,1728001919999,394554.55187800,3098,122.70740000,288122.45556500,0],
[1728001920000,2349.09000000,2349.09000000,2345.78000000,2348.03000000,155.96240000,1728001979999,366171.59366500,1952,32.69350000,76737.98778700,0],
[1728001980000,2348.02000000,2348.02000000,2344.70000000,2346.14000000,117.91290000,1728002039999,276654.37719000,4397,20.79150000,48771.79401200,0],
[1728002040000,2346.14000000,2347.31000000,2344.33000000,2346.29000000,95.66370000,1728002099999,224431.21440600,2853,59.61890000,139871.90037400,0],
[1728002100000,2346.29000000,2346.91000000,2343.00000000,2343.83000000,56.06620000,1728002159999,131488.89216300,4157,19.88320000,46625.89167200,0],
[1728002160000,2343.84000000,2345.04000000,2343.00000000,2344.57000000,158.11310000,1728002219999,370543.84771500,2502,53.13690000,124538.17797500,0],
[1728002220000,2344.57000000,2344.57000000,2341.76000000,2342.13000000,103.93610000,1728002279999,243517.70025600,1492,35.36430000,82840.89521400,0],
[1728002280000,2342.13000000,2343.90000000,2342.10000000,2343.02000000,73.15490000,1728002339999,171401.49850700,2015,32.93130000,77156.08191400,0],
[1728002340000,2343.02000000,2344.20000000,2342.60000000,2343.84000000,30.65150000,1728002399999,71834.56431100,1189,17.82590000,41777.88380600,0],
[1728002400000,2343.83000000,2344.16000000,2342.01000000,2343.22000000,28.68060000,1728002459999,67200.85506900,1469,12.54620000,29396.97432400,0],
[1728002460000,2343.24000000,2343.52000000,2341.38000000,2343.19000000,56.30490000,1728002519999,131883.61082900,888,12.29990000,28812.64178600,0],
[1728002520000,2343.19000000,2345.80000000,2343.12000000,2344.81000000,55.47610000,1728002579999,130073.41453600,1709,34.67300000,81295.90874300,0],
[1728002580000,2344.81000000,2344.81000000,2342.72000000,2343.96000000,110.29330000,1728002639999,258490.80902600,2025,13.74120000,32202.26393900,0],
[1728002640000,2343.96000000,2345.25000000,2343.81000000,2345.25000000,65.92280000,1728002699999,154561.31524100,2850,57.95570000,135880.12798800,0],
[1728002700000,2345.26000000,2348.27000000,2345.26000000,2346.37000000,89.16350000,1728002759999,209247.64832700,5674,57.38830000,134670.50846400,0],
[1728002760000,2346.39000000,2347.04000000,2345.45000000,2346.00000000,56.42280000,1728002819999,132383.47019100,4069,35.01520000,82151.49362800,0],
[1728002820000,2346.01000000,2346.59000000,2345.52000000,2345.63000000,71.17790000,1728002879999,166979.56724800,3942,22.29270000,52295.90454600,0],
[1728002880000,2345.61000000,2346.00000000,2344.76000000,2345.12000000,99.93250000,1728002939999,234369.06215700,4379,23.48140000,55071.56338400,0],
[1728002940000,2345.12000000,2345.29000000,2341.93000000,2342.03000000,71.07780000,1728002999999,166572.07251900,2159,14.66680000,34360.20764500,0],
[1728003000000,2342.03000000,2344.14000000,2342.03000000,2343.73000000,28.13320000,1728003059999,65923.73367700,2900,22.58030000,52909.31345600,0],
[1728003060000,2343.74000000,2344.48000000,2342.38000000,2342.59000000,92.09260000,1728003119999,215818.47598100,2294,17.09880000,40064.62433700,0],
[1728003120000,2342.59000000,2343.44000000,2341.88000000,2343.32000000,72.93300000,1728003179999,170842.05510800,3004,43.30910000,101448.51345600,0],
[1728003180000,2343.33000000,2343.33000000,2339.89000000,2340.22000000,296.49570000,1728003239999,694253.01937600,4242,50.42100000,118047.11736900,0],
[1728003240000,2340.21000000,2341.10000000,2339.90000000,2340.53000000,55.07980000,1728003299999,128918.09447500,2635,21.74940000,50903.97305000,0],
[1728003300000,2340.53000000,2342.39000000,2340.29000000,2340.59000000,82.44620000,1728003359999,193017.93886200,2081,71.43650000,167239.78504200,0],
[1728003360000,2340.60000000,2341.60000000,2340.00000000,2340.39000000,449.31450000,1728003419999,1051693.14626100,2505,60.95190000,142661.83025200,0],
[1728003420000,2340.37000000,2341.80000000,2340.22000000,2341.22000000,161.04680000,1728003479999,376948.50008000,3280,133.59270000,312683.06256400,0],
[1728003480000,2341.22000000,2341.22000000,2339.15000000,2340.52000000,91.88580000,1728003539999,215001.23546600,2572,60.13730000,140709.12227900,0],
[1728003540000,2340.52000000,2340.80000000,2340.36000000,2340.36000000,51.89390000,1728003599999,121461.40018300,550,21.48470000,50285.72916300,0],
[1728003600000,2340.37000000,2341.89000000,2340.21000000,2341.23000000,60.38410000,1728003659999,141347.57967100,2601,40.68340000,95231.95704800,0],
[1728003660000,2341.22000000,2341.23000000,2340.28000000,2340.75000000,44.48420000,1728003719999,104123.37652300,3007,13.00110000,30430.61621800,0],
[1728003720000,2340.75000000,2343.89000000,2340.75000000,2343.47000000,60.22000000,1728003779999,141080.87097300,2714,43.74380000,102473.48061100,0],
[1728003780000,2343.48000000,2344.25000000,2342.90000000,2342.90000000,39.64520000,1728003839999,92905.94032600,782,9.32930000,21864.76430200,0],
[1728003840000,2342.89000000,2344.49000000,2342.89000000,2344.10000000,47.36110000,1728003899999,111009.16111300,2092,33.06270000,77496.42669000,0],
[1728003900000,2344.10000000,2344.10000000,2339.89000000,2341.00000000,236.95640000,1728003959999,554704.11524400,2879,158.46620000,370901.78361100,0],
[1728003960000,2340.99000000,2344.15000000,2340.99000000,2343.49000000,61.44080000,1728004019999,143938.59511400,4739,41.17570000,96448.80779100,0],
[1728004020000,2343.49000000,2344.40000000,2342.36000000,2342.37000000,109.59550000,1728004079999,256897.18336200,1957,73.15070000,171475.29930000,0],
[1728004080000,2342.36000000,2344.16000000,2341.94000000,2344.16000000,40.04090000,1728004139999,93819.83409300,3243,28.61980000,67059.04505500,0],
[1728004140000,2344.15000000,2344.19000000,2343.44000000,2343.96000000,34.45980000,1728004199999,80769.35041600,1882,5.90900000,13850.21156700,0],
[1728004200000,2343.95000000,2347.76000000,2343.37000000,2346.56000000,109.06680000,1728004259999,255882.10346500,3150,78.46630000,184088.62815400,0],
[1728004260000,2346.56000000,2347.00000000,2345.60000000,2345.61000000,91.28580000,1728004319999,214164.23760800,2598,13.44370000,31543.59105600,0],
[1728004320000,2345.61000000,2345.73000000,2343.70000000,2344.53000000,126.03740000,1728004379999,295532.55175400,2887,44.40930000,104123.37249900,0],
[1728004380000,2344.52000000,2347.20000000,2344.52000000,2346.26000000,63.71250000,1728004439999,149470.67901400,1888,39.33050000,92259.44087700,0],
[1728004440000,2346.25000000,2346.98000000,2345.83000000,2345.86000000,87.03170000,1728004499999,204198.63378900,1884,33.57320000,78772.22482700,0],
[1728004500000,2345.82000000,2348.66000000,2345.61000000,2348.66000000,94.24670000,1728004559999,221212.90074300,1918,64.78790000,152077.11471300,0],
[1728004560000,2348.65000000,2349.48000000,2348.58000000,2348.85000000,127.14810000,1728004619999,298666.15392900,2949,85.75240000,201431.37143500,0],
[1728004620000,2348.86000000,2349.63000000,2348.00000000,2348.00000000,24.35760000,1728004679999,57211.98534500,2845,5.21460000,12248.59732400,0],
[1728004680000,2348.01000000,2350.92000000,2348.01000000,2350.80000000,125.27550000,1728004739999,294429.90391400,4009,101.91970000,239542.62271000,0],
[1728004740000,2350.79000000,2352.90000000,2350.39000000,2351.79000000,139.41340000,1728004799999,327867.82932200,2706,85.58240000,201285.75844500,0],
[1728004800000,2351.80000000,2351.80000000,2350.32000000,2350.52000000,99.42050000,1728004859999,233777.04792400,2363,20.30360000,47737.91902900,0],
[1728004860000,2350.53000000,2351.48000000,2350.27000000,2351.48000000,43.28620000,1728004919999,101752.96598200,3779,17.48370000,41099.54928500,0],
[1728004920000,2351.47000000,2358.25000000,2351.47000000,2358.00000000,273.57880000,1728004979999,644395.62396800,5488,230.80980000,543661.30741000,0],
[1728004980000,2358.06000000,2364.13000000,2356.08000000,2361.03000000,697.12610000,1728005039999,1645386.42418800,7372,472.75240000,1115863.50842600,0],
[1728005040000,2361.01000000,2365.26000000,2361.00000000,2364.54000000,1229.66230000,1728005099999,2907506.08257900,6684,783.48960000,1852391.10127800,0],
[1728005100000,2364.53000000,2364.68000000,2360.97000000,2362.09000000,200.73470000,1728005159999,474377.59361000,3698,91.91590000,217209.32632600,0],
[1728005160000,2362.09000000,2374.33000000,2361.35000000,2371.64000000,1640.96970000,1728005219999,3891194.14615200,9409,1011.26640000,2397245.30067800,0],
[1728005220000,2371.65000000,2376.60000000,2371.65000000,2375.63000000,659.20410000,1728005279999,1565123.52024100,7967,466.03610000,1106466.09055900,0],
[1728005280000,2375.64000000,2378.00000000,2374.56000000,2376.60000000,1569.40520000,1728005339999,3729056.41867500,10082,546.10880000,1297566.26365400,0],
[1728005340000,2376.59000000,2378.19000000,2371.01000000,2372.23000000,847.71210000,1728005399999,2013699.67945800,5063,463.27840000,1100653.86366000,0],
[1728005400000,2372.24000000,2374.78000000,2371.50000000,2374.77000000,400.03200000,1728005459999,949362.43891300,8704,242.24230000,574908.41811100,0],
[1728005460000,2374.78000000,2378.81000000,2374.78000000,2377.81000000,520.07810000,1728005519999,1235831.53055100,5155,375.60500000,892453.50830000,0],
[1728005520000,2377.80000000,2378.80000000,2376.00000000,2376.31000000,295.39800000,1728005579999,702229.25011400,6990,99.86440000,237404.90366000,0],
[1728005580000,2376.32000000,2376.32000000,2372.90000000,2373.34000000,217.20170000,1728005639999,515682.33016200,7441,39.47960000,93707.81662300,0],
[1728005640000,2373.33000000,2374.14000000,2368.39000000,2368.87000000,387.66860000,1728005699999,919293.24918700,5749,104.27950000,247278.55610000,0],
[1728005700000,2368.88000000,2368.88000000,2367.01000000,2367.81000000,176.50940000,1728005759999,417947.76922000,2963,64.75880000,153322.99222900,0],
[1728005760000,2367.81000000,2369.30000000,2367.46000000,2367.86000000,131.10620000,1728005819999,310506.07007300,3037,84.65020000,200471.74762300,0],
[1728005820000,2367.87000000,2371.20000000,2367.37000000,2370.33000000,103.64400000,1728005879999,245649.03364500,3992,45.09650000,106864.03481500,0],
[1728005880000,2370.32000000,2371.20000000,2366.76000000,2368.32000000,599.66010000,1728005939999,1419935.32274800,2754,27.04940000,64081.90774000,0],
[1728005940000,2368.32000000,2368.80000000,2365.20000000,2365.21000000,152.91570000,1728005999999,361939.40806900,3369,53.66090000,126974.16830000,0],
[1728006000000,2365.21000000,2365.70000000,2363.04000000,2363.77000000,153.98820000,1728006059999,364026.39715500,2792,66.31270000,156752.23877200,0],
[1728006060000,2363.76000000,2367.36000000,2363.58000000,2367.09000000,388.32820000,1728006119999,918772.35012200,1950,276.67640000,654620.52308200,0],
[1728006120000,2367.10000000,2367.10000000,2363.88000000,2366.05000000,143.51120000,1728006179999,339405.71106600,2399,38.24580000,90456.74644300,0],
[1728006180000,2366.04000000,2367.93000000,2365.45000000,2367.93000000,145.37170000,1728006239999,343993.18634000,3165,122.69320000,290324.95780000,0],
[1728006240000,2367.93000000,2368.90000000,2366.93000000,2367.28000000,129.81780000,1728006299999,307403.41674000,2207,88.51760000,209602.81033900,0],
[1728006300000,2367.28000000,2368.91000000,2366.62000000,2368.79000000,130.54150000,1728006359999,309154.89322000,3134,30.40130000,71990.34135600,0],
[1728006360000,2368.80000000,2370.78000000,2368.80000000,2370.39000000,206.94880000,1728006419999,490443.35533700,4593,93.33290000,221167.85960200,0],
[1728006420000,2370.40000000,2372.69000000,2370.24000000,2372.40000000,110.16840000,1728006479999,261207.96319500,3823,89.63010000,212509.18934900,0],
[1728006480000,2372.39000000,2374.72000000,2371.80000000,2374.71000000,182.61660000,1728006539999,433387.03063900,3237,155.10980000,368115.73343200,0],
[1728006540000,2374.71000000,2374.80000000,2371.16000000,2374.75000000,677.65920000,1728006599999,1608481.83531100,2997,303.08980000,719370.50428100,0],
[1728006600000,2374.74000000,2376.63000000,2372.04000000,2376.22000000,290.20810000,1728006659999,689269.33671900,3043,234.85880000,557810.56642300,0],
[1728006660000,2376.22000000,2377.28000000,2375.87000000,2377.28000000,202.39210000,1728006719999,480926.23539700,1111,111.65230000,265310.79224300,0],
[1728006720000,2377.27000000,2377.27000000,2376.03000000,2376.66000000,174.75010000,1728006779999,415316.55096000,2789,97.40430000,231479.38529600,0],
[1728006780000,2376.66000000,2377.60000000,2376.42000000,2377.30000000,350.61670000,1728006839999,833407.19772600,2632,214.36100000,509519.27389800,0],
[1728006840000,2377.29000000,2378.73000000,2375.89000000,2377.80000000,259.34220000,1728006899999,616609.98134400,2532,209.58370000,498315.75964800,0],
[1728006900000,2377.80000000,2378.54000000,2375.86000000,2375.87000000,114.93470000,1728006959999,273196.31039000,3830,51.81950000,123174.44003200,0],
[1728006960000,2375.86000000,2377.08000000,2375.84000000,2376.22000000,126.02530000,1728007019999,299453.02499300,2672,91.71040000,217910.60410300,0],
[1728007020000,2376.22000000,2376.23000000,2375.80000000,2375.84000000,46.53770000,1728007079999,110571.39788200,719,12.70920000,30195.36426900,0],
[1728007080000,2375.85000000,2378.57000000,2375.62000000,2378.20000000,159.05980000,1728007139999,378157.22266400,1311,127.41040000,302920.84693900,0],
[1728007140000,2378.21000000,2378.92000000,2377.10000000,2377.56000000,605.79000000,1728007199999,1440760.38863600,1533,108.11520000,257126.32313600,0],
[1728007200000,2377.56000000,2378.92000000,2376.54000000,2378.92000000,121.82790000,1728007259999,289720.38409400,2881,61.64790000,146593.12691500,0],
[1728007260000,2378.91000000,2378.91000000,2377.28000000,2378.36000000,117.54470000,1728007319999,279528.82088900,3153,40.81220000,97057.45605400,0],
[1728007320000,2378.36000000,2379.53000000,2378.22000000,2379.53000000,119.59840000,1728007379999,284525.36456400,1246,86.82600000,206561.11752000,0],
[1728007380000,2379.53000000,2380.00000000,2377.11000000,2377.21000000,200.35650000,1728007439999,476633.57574000,2929,117.21680000,278854.26726300,0],
[1728007440000,2377.21000000,2377.21000000,2373.73000000,2373.74000000,199.58500000,1728007499999,474115.60441500,1704,29.10450000,69134.76130900,0],
[1728007500000,2373.74000000,2375.19000000,2373.58000000,2373.58000000,108.62970000,1728007559999,257953.59812100,2683,75.01150000,178114.07330500,0],
[1728007560000,2373.61000000,2375.83000000,2372.21000000,2375.83000000,141.11520000,1728007619999,334953.28544700,3776,76.91610000,182593.93585100,0],
[1728007620000,2375.82000000,2377.40000000,2374.56000000,2376.18000000,145.12640000,1728007679999,344773.24844000,4619,114.28140000,271494.40165900,0],
[1728007680000,2376.17000000,2376.17000000,2374.44000000,2374.54000000,122.26020000,1728007739999,290342.54510300,1211,47.16380000,112007.94046900,0],
[1728007740000,2374.53000000,2374.60000000,2372.68000000,2373.20000000,83.92520000,1728007799999,199231.61636700,2057,41.35180000,98174.91638300,0],
[1728007800000,2373.20000000,2375.83000000,2373.20000000,2375.41000000,114.46900000,1728007859999,271876.38830200,1895,86.44460000,205305.61813700,0],
[1728007860000,2375.40000000,2375.40000000,2371.88000000,2372.31000000,86.53700000,1728007919999,205402.24561700,1344,36.76100000,87273.24746500,0],
[1728007920000,2372.30000000,2373.07000000,2371.81000000,2372.54000000,83.46610000,1728007979999,198038.50393800,1127,49.42580000,117273.99166200,0],
[1728007980000,2372.54000000,2373.19000000,2372.06000000,2373.18000000,49.26430000,1728008039999,116883.23205800,1241,36.65210000,86959.61005700,0],
[1728008040000,2373.19000000,2373.55000000,2373.10000000,2373.11000000,94.58780000,1728008099999,224497.29954100,439,73.57890000,174634.37535600,0],
[1728008100000,2373.10000000,2375.28000000,2372.87000000,2375.28000000,65.46630000,1728008159999,155440.62905500,1875,42.75290000,101509.85822900,0],
[1728008160000,2375.30000000,2376.86000000,2373.70000000,2373.70000000,145.50180000,1728008219999,345639.20205200,2392,57.50140000,136578.76365700,0],
[1728008220000,2373.70000000,2373.90000000,2371.64000000,2372.30000000,131.75530000,1728008279999,312560.79166600,2369,17.59760000,41748.53809800,0],
[1728008280000,2372.31000000,2372.31000000,2371.12000000,2371.96000000,136.23710000,1728008339999,323116.16345300,3653,72.43400000,171782.00462200,0],
[1728008340000,2371.96000000,2371.96000000,2370.90000000,2370.90000000,18.16010000,1728008399999,43062.77967900,997,6.79540000,16114.51786400,0],
[1728008400000,2370.91000000,2371.80000000,2370.00000000,2370.20000000,151.40440000,1728008459999,358989.52153000,2384,64.07120000,151919.35031200,0],
[1728008460000,2370.21000000,2370.99000000,2370.00000000,2370.42000000,72.34410000,1728008519999,171472.18603300,1411,25.26030000,59871.18688400,0],
[1728008520000,2370.42000000,2370.81000000,2368.40000000,2368.40000000,1104.44120000,1728008579999,2617475.21008200,1790,22.92930000,54343.82966800,0],
[1728008580000,2368.41000000,2370.72000000,2368.41000000,2369.21000000,405.50650000,1728008639999,960849.90104300,3061,236.53580000,560410.83142600,0],
[1728008640000,2369.20000000,2369.88000000,2368.54000000,2368.54000000,442.26010000,1728008699999,1047770.95804300,798,126.07200000,298720.38413400,0],
[1728008700000,2368.54000000,2368.72000000,2366.99000000,2367.21000000,1307.84530000,1728008759999,3096247.09280700,2104,677.10490000,1602864.29886300,0],
[1728008760000,2367.21000000,2368.50000000,2367.00000000,2368.00000000,349.08100000,1728008819999,826445.69487200,3480,251.91870000,596409.23026100,0],
[1728008820000,2368.00000000,2369.81000000,2367.61000000,2369.80000000,127.99590000,1728008879999,303111.72557800,764,56.35190000,133479.24239000,0],
[1728008880000,2369.81000000,2371.27000000,2369.80000000,2370.61000000,61.51860000,1728008939999,145824.03380600,1273,29.00690000,68752.32561100,0],
[1728008940000,2370.62000000,2371.29000000,2370.40000000,2370.94000000,95.89700000,1728008999999,227345.75937700,1062,65.38080000,154994.04417100,0],
[1728009000000,2370.93000000,2373.89000000,2370.45000000,2373.89000000,269.78330000,1728009059999,639972.34740600,1636,177.16670000,420293.47317900,0],
[1728009060000,2373.89000000,2376.01000000,2373.89000000,2376.01000000,665.45390000,1728009119999,1580956.61047400,1073,289.05860000,686655.51910600,0],
[1728009120000,2376.00000000,2376.00000000,2373.63000000,2374.78000000,217.27140000,1728009179999,516136.34763600,1009,27.35090000,64932.85998300,0],
[1728009180000,2374.78000000,2377.93000000,2374.78000000,2376.55000000,123.47800000,1728009239999,293432.22620500,1864,81.10830000,192732.98738800,0],
[1728009240000,2376.56000000,2376.56000000,2373.73000000,2374.25000000,54.77710000,1728009299999,130105.94437200,1091,32.31450000,76753.24513500,0],
[1728009300000,2374.26000000,2375.15000000,2372.15000000,2373.02000000,138.76320000,1728009359999,329418.86947600,1777,32.33110000,76720.61574500,0],
[1728009360000,2373.01000000,2374.99000000,2373.01000000,2374.43000000,40.24790000,1728009419999,95553.96557200,2848,25.37450000,60240.72259200,0],
[1728009420000,2374.43000000,2375.10000000,2374.43000000,2374.54000000,52.57290000,1728009479999,124849.73657200,1842,41.63430000,98872.29274100,0],
[1728009480000,2374.53000000,2374.60000000,2374.14000000,2374.42000000,33.65550000,1728009539999,79910.18059800,774,24.46340000,58085.16428800,0],
[1728009540000,2374.42000000,2375.78000000,2374.42000000,2375.61000000,24.61220000,1728009599999,58451.56798900,1073,16.92780000,40201.08428100,0],
[1728009600000,2375.60000000,2375.61000000,2374.61000000,2375.20000000,29.08900000,1728009659999,69087.04277700,1040,16.31530000,38747.08266100,0],
[1728009660000,2375.19000000,2375.34000000,2374.34000000,2375.30000000,124.10740000,1728009719999,294750.39071200,1361,53.94450000,128110.87077900,0],
[1728009720000,2375.31000000,2375.82000000,2374.72000000,2374.98000000,353.00440000,1728009779999,838503.07812300,1730,26.77280000,63584.89433500,0],
[1728009780000,2374.98000000,2375.07000000,2373.16000000,2373.17000000,92.46130000,1728009839999,219564.47164100,848,32.60990000,77440.74148600,0],
[1728009840000,2373.17000000,2373.17000000,2372.57000000,2372.61000000,65.49180000,1728009899999,155397.23071400,1196,21.16600000,50222.86185000,0],
[1728009900000,2372.61000000,2373.24000000,2371.00000000,2371.00000000,97.87810000,1728009959999,232189.54048300,1626,26.47400000,62811.92645000,0],
[1728009960000,2371.00000000,2371.01000000,2369.67000000,2370.51000000,147.71760000,1728010019999,350152.58971500,1981,51.76020000,122691.36432200,0],
[1728010020000,2370.50000000,2372.87000000,2369.45000000,2372.20000000,380.87740000,1728010079999,903145.39313300,2125,361.16550000,856421.78675600,0],
[1728010080000,2372.19000000,2374.40000000,2371.39000000,2373.60000000,195.46120000,1728010139999,463822.74742700,2435,144.40400000,342699.26589700,0],
[1728010140000,2373.60000000,2375.29000000,2373.40000000,2374.00000000,666.75820000,1728010199999,1583312.29981200,1245,636.95050000,1512544.10187800,0],
[1728010200000,2374.01000000,2374.20000000,2372.74000000,2373.30000000,108.81890000,1728010259999,258282.58678500,1854,17.52640000,41592.62163400,0],
[1728010260000,2373.30000000,2373.31000000,2371.00000000,2371.17000000,86.78620000,1728010319999,205881.27549700,1002,17.41040000,41289.07136800,0],
[1728010320000,2371.16000000,2371.30000000,2370.45000000,2370.90000000,36.87760000,1728010379999,87426.87732700,976,17.82860000,42266.42739200,0],
[1728010380000,2370.90000000,2371.00000000,2370.00000000,2370.00000000,28.66390000,1728010439999,67944.22396400,1245,6.91800000,16398.82466800,0],
[1728010440000,2370.00000000,2370.70000000,2370.00000000,2370.40000000,26.00360000,1728010499999,61637.58297500,518,13.04180000,30913.67576300,0],
[1728010500000,2370.40000000,2371.26000000,2370.40000000,2371.07000000,17.03050000,1728010559999,40381.01096700,692,11.64800000,27618.13522100,0],
[1728010560000,2371.07000000,2371.67000000,2370.90000000,2371.67000000,105.10680000,1728010619999,249238.86938400,553,24.12530000,57207.87787000,0],
[1728010620000,2371.68000000,2373.29000000,2371.68000000,2372.87000000,61.27100000,1728010679999,145360.81114100,479,44.76660000,106199.08053600,0],
[1728010680000,2372.88000000,2372.88000000,2371.48000000,2371.49000000,91.85280000,1728010739999,217907.90873400,896,7.01600000,16644.16826600,0],
[1728010740000,2371.49000000,2371.49000000,2370.40000000,2370.40000000,42.07020000,1728010799999,99760.20405100,397,3.43290000,8139.56390600,0],
[1728010800000,2370.41000000,2371.87000000,2370.41000000,2371.31000000,56.15230000,1728010859999,133146.36599000,1282,40.89900000,96971.73532200,0],
[1728010860000,2371.31000000,2371.32000000,2370.46000000,2370.97000000,114.45100000,1728010919999,271354.01298600,659,19.79520000,46930.53408300,0],
[1728010920000,2370.96000000,2370.96000000,2369.21000000,2370.77000000,81.15600000,1728010979999,192347.21244400,1034,33.91140000,80369.62228000,0],
[1728010980000,2370.77000000,2370.77000000,2370.40000000,2370.58000000,32.25660000,1728011039999,76467.26516800,382,13.32440000,31586.92673500,0],
[1728011040000,2370.59000000,2370.59000000,2368.08000000,2368.35000000,184.62930000,1728011099999,437408.56656400,2102,19.54520000,46313.84139300,0],
[1728011100000,2368.35000000,2368.35000000,2366.60000000,2366.60000000,49.44250000,1728011159999,117061.24855700,840,9.84960000,23321.05727800,0],
[1728011160000,2366.61000000,2366.61000000,2366.22000000,2366.30000000,84.85620000,1728011219999,200806.49967900,955,24.35730000,57639.27574900,0],
[1728011220000,2366.31000000,2366.38000000,2364.66000000,2365.05000000,132.90200000,1728011279999,314357.56732800,1233,66.02600000,156146.08379100,0],
[1728011280000,2365.04000000,2365.77000000,2364.61000000,2365.60000000,40.92670000,1728011339999,96798.88271800,843,25.34210000,59937.34662300,0],
[1728011340000,2365.59000000,2365.99000000,2365.56000000,2365.57000000,31.42350000,1728011399999,74341.54106900,610,14.46550000,34221.41091700,0],
[1728011400000,2365.57000000,2366.18000000,2365.57000000,2366.12000000,104.52890000,1728011459999,247315.02561600,869,33.31050000,78811.57155300,0],
[1728011460000,2366.12000000,2366.12000000,2365.24000000,2365.65000000,24.45380000,1728011519999,57849.24591700,589,13.72950000,32478.71126100,0],
[1728011520000,2365.66000000,2366.18000000,2365.50000000,2365.64000000,81.33960000,1728011579999,192437.85446600,1194,21.21680000,50194.77366900,0],
[1728011580000,2365.65000000,2365.69000000,2364.69000000,2364.70000000,35.34950000,1728011639999,83611.82222700,1002,16.84720000,39847.15214900,0],
[1728011640000,2364.69000000,2364.69000000,2364.40000000,2364.40000000,98.18530000,1728011699999,232159.65085000,422,42.52910000,100559.13713000,0],
[1728011700000,2364.41000000,2365.60000000,2364.20000000,2365.60000000,32.43620000,1728011759999,76699.58402900,953,20.61210000,48740.82752500,0],
[1728011760000,2365.59000000,2365.59000000,2364.69000000,2364.69000000,44.68090000,1728011819999,105678.85559100,829,29.28740000,69271.69728100,0],
[1728011820000,2364.70000000,2366.55000000,2364.70000000,2364.88000000,39.85860000,1728011879999,94294.64880600,1307,20.02050000,47362.33469300,0],
[1728011880000,2364.87000000,2365.50000000,2364.87000000,2365.36000000,26.09670000,1728011939999,61725.32064200,732,8.78380000,20774.43662500,0],
[1728011940000,2365.37000000,2365.37000000,2364.69000000,2364.96000000,33.18900000,1728011999999,78489.35864600,819,27.36470000,64714.69528800,0],
[1728012000000,2364.96000000,2366.80000000,2364.96000000,2366.56000000,53.11300000,1728012059999,125673.49381800,725,42.64870000,100909.87122700,0],
[1728012060000,2366.56000000,2367.35000000,2366.54000000,2366.64000000,37.33910000,1728012119999,88372.94455700,1030,22.45560000,53147.40233400,0],
[1728012120000,2366.63000000,2367.00000000,2365.79000000,2366.51000000,27.16230000,1728012179999,64272.58230700,1604,17.96990000,42520.32713800,0],
[1728012180000,2366.50000000,2366.80000000,2366.36000000,2366.80000000,16.25310000,1728012239999,38461.99410900,505,10.61330000,25116.06048800,0],
[1728012240000,2366.79000000,2366.80000000,2365.92000000,2365.93000000,45.78200000,1728012299999,108321.84299200,621,10.84360000,25655.97378800,0],
[1728012300000,2365.93000000,2365.93000000,2363.69000000,2365.30000000,66.38090000,1728012359999,156955.14995100,1572,28.36610000,67061.25646300,0],
[1728012360000,2365.30000000,2365.30000000,2364.41000000,2364.53000000,39.66540000,1728012419999,93790.97821200,538,5.84490000,13820.84664400,0],
[1728012420000,2364.54000000,2365.17000000,2363.00000000,2363.01000000,73.46950000,1728012479999,173712.08664700,1972,24.15730000,57117.23739100,0],
[1728012480000,2363.01000000,2363.34000000,2362.75000000,2362.76000000,91.14820000,1728012539999,215385.03391600,899,60.12490000,142076.01844000,0],
[1728012540000,2362.75000000,2363.10000000,2362.74000000,2363.07000000,61.50510000,1728012599999,145326.55848700,745,50.30800000,118867.77905700,0],
[1728012600000,2363.08000000,2364.10000000,2362.91000000,2363.58000000,54.58600000,1728012659999,129020.43942100,799,18.44290000,43589.85974900,0],
[1728012660000,2363.59000000,2364.30000000,2363.30000000,2364.30000000,42.66580000,1728012719999,100854.82874400,1303,14.62260000,34568.42103800,0],
[1728012720000,2364.30000000,2364.55000000,2364.01000000,2364.26000000,47.17900000,1728012779999,111544.16183400,368,35.46190000,83840.59332300,0],
[1728012780000,2364.26000000,2364.26000000,2361.35000000,2361.42000000,102.90110000,1728012839999,243091.55678600,1488,23.54760000,55619.72399200,0],
[1728012840000,2361.43000000,2363.05000000,2361.43000000,2363.05000000,34.12700000,1728012899999,80624.94224200,1125,24.93380000,58905.84402900,0],
[1728012900000,2363.05000000,2364.26000000,2362.61000000,2363.72000000,49.23880000,1728012959999,116388.40285500,1251,23.40980000,55333.08787700,0],
[1728012960000,2363.71000000,2364.76000000,2363.71000000,2364.41000000,33.15860000,1728013019999,78399.99020200,594,23.06370000,54529.96947900,0],
[1728013020000,2364.40000000,2365.25000000,2364.40000000,2365.25000000,72.64960000,1728013079999,171808.91714500,1167,36.44020000,86177.31606100,0],
[1728013080000,2365.25000000,2366.83000000,2365.25000000,2366.83000000,129.61850000,1728013139999,306711.73973500,1412,85.26730000,201762.88681000,0],
[1728013140000,2366.83000000,2366.96000000,2366.21000000,2366.21000000,31.76520000,1728013199999,75177.01961800,391,16.78890000,39732.51127700,0],
[1728013200000,2366.22000000,2366.22000000,2365.22000000,2365.46000000,37.47240000,1728013259999,88643.24926200,688,22.37260000,52920.27667700,0],
[1728013260000,2365.47000000,2365.80000000,2365.22000000,2365.79000000,19.89760000,1728013319999,47067.46637100,1128,12.40790000,29350.41719800,0],
[1728013320000,2365.80000000,2365.80000000,2365.22000000,2365.27000000,16.72910000,1728013379999,39573.55906900,412,12.87960000,30467.28921500,0],
[1728013380000,2365.27000000,2365.46000000,2364.83000000,2364.84000000,76.17040000,1728013439999,180159.72108700,429,16.67660000,39444.17494200,0],
[1728013440000,2364.84000000,2365.78000000,2364.84000000,2365.20000000,44.88370000,1728013499999,106167.98667400,1665,21.30320000,50387.56239600,0],
[1728013500000,2365.20000000,2365.41000000,2365.20000000,2365.28000000,6.05110000,1728013559999,14312.40876500,646,4.11130000,9724.24261100,0],
[1728013560000,2365.28000000,2365.92000000,2363.92000000,2365.76000000,68.70680000,1728013619999,162484.58878600,2581,35.82130000,84715.53220700,0],
[1728013620000,2365.76000000,2365.91000000,2365.01000000,2365.33000000,44.59520000,1728013679999,105486.23046100,1281,13.03200000,30826.18009600,0],
[1728013680000,2365.33000000,2365.91000000,2365.32000000,2365.90000000,67.60200000,1728013739999,159907.65123800,363,53.62930000,126857.23534900,0],
[1728013740000,2365.91000000,2365.91000000,2364.32000000,2364.33000000,33.63640000,1728013799999,79559.49853900,359,5.86520000,13873.33311400,0],
[1728013800000,2364.33000000,2365.20000000,2363.91000000,2365.09000000,70.58260000,1728013859999,166891.44894400,997,42.57180000,100648.47056700,0],
[1728013860000,2365.09000000,2368.60000000,2365.09000000,2367.53000000,88.96210000,1728013919999,210569.15757500,1738,63.17680000,149550.10506400,0],
[1728013920000,2367.53000000,2367.53000000,2366.75000000,2366.75000000,35.09980000,1728013979999,83079.59237300,247,14.52250000,34373.49151500,0],
[1728013980000,2366.75000000,2367.13000000,2366.32000000,2367.13000000,31.27560000,1728014039999,74014.19676100,519,20.56240000,48660.83868500,0],
[1728014040000,2367.12000000,2367.12000000,2365.70000000,2365.70000000,26.68930000,1728014099999,63155.10093700,1008,6.25730000,14806.62218900,0],
[1728014100000,2365.71000000,2366.37000000,2365.37000000,2366.00000000,25.44600000,1728014159999,60200.96853800,831,15.84270000,37480.47649900,0],
[1728014160000,2365.99000000,2365.99000000,2365.69000000,2365.69000000,24.91430000,1728014219999,58941.90710900,208,4.76400000,11270.34121100,0],
[1728014220000,2365.69000000,2365.69000000,2365.58000000,2365.67000000,63.89300000,1728014279999,151149.83015100,308,7.41980000,17552.37037400,0],
[1728014280000,2365.67000000,2366.43000000,2365.67000000,2366.29000000,414.41690000,1728014339999,980541.77953700,1051,166.93930000,394952.87510200,0],
[1728014340000,2366.29000000,2367.47000000,2366.28000000,2367.06000000,254.94310000,1728014399999,603389.39564000,1214,159.73350000,377998.19587100,0],
[1728014400000,2367.07000000,2367.40000000,2367.06000000,2367.40000000,78.09050000,1728014459999,184850.64773400,266,64.15750000,151866.46926600,0],
[1728014460000,2367.39000000,2368.38000000,2367.39000000,2368.38000000,138.78570000,1728014519999,328584.33036900,452,135.00500000,319631.45019400,0],
[1728014520000,2368.38000000,2369.20000000,2368.38000000,2368.55000000,48.59290000,1728014579999,115116.27486300,820,14.53240000,34427.05962800,0],
[1728014580000,2368.54000000,2368.80000000,2368.30000000,2368.65000000,89.95800000,1728014639999,213084.68558200,778,21.58820000,51135.28415200,0],
[1728014640000,2368.65000000,2369.37000000,2368.30000000,2369.35000000,318.12450000,1728014699999,753537.26954600,841,281.18810000,666047.60020000,0],
[1728014700000,2369.35000000,2369.36000000,2369.35000000,2369.36000000,16.58750000,1728014759999,39301.73021500,63,13.70900000,32481.55624000,0],
[1728014760000,2369.36000000,2369.37000000,2368.79000000,2369.36000000,35.63390000,1728014819999,84421.30603600,402,17.95680000,42540.17714900,0],
[1728014820000,2369.36000000,2369.76000000,2369.36000000,2369.58000000,152.19090000,1728014879999,360606.61224200,340,120.13580000,284650.06641700,0],
[1728014880000,2369.58000000,2369.60000000,2369.20000000,2369.25000000,142.14500000,1728014939999,336788.96959200,355,13.75050000,32581.90358400,0],
[1728014940000,2369.25000000,2369.60000000,2367.53000000,2367.53000000,132.39410000,1728014999999,313660.31082700,1102,20.04520000,47487.91366500,0],
[1728015000000,2367.50000000,2368.50000000,2367.49000000,2367.50000000,287.20810000,1728015059999,680048.26439000,1031,140.61070000,332931.77541500,0],
[1728015060000,2367.50000000,2367.50000000,2366.65000000,2366.65000000,126.65260000,1728015119999,299753.60717800,432,9.54580000,22592.99865900,0],
[1728015120000,2366.65000000,2367.35000000,2366.60000000,2367.34000000,83.45430000,1728015179999,197538.74555100,823,23.34460000,55251.45388000,0],
[1728015180000,2367.35000000,2367.35000000,2367.34000000,2367.34000000,19.79740000,1728015239999,46867.30348900,68,12.65730000,29964.25915500,0],
[1728015240000,2367.35000000,2367.93000000,2367.34000000,2367.93000000,28.47630000,1728015299999,67426.36522100,322,25.27850000,59854.58722400,0],
[1728015300000,2367.93000000,2367.93000000,2365.64000000,2365.64000000,99.08520000,1728015359999,234543.35076300,1264,11.16980000,26439.69616300,0],
[1728015360000,2365.63000000,2368.94000000,2365.63000000,2368.77000000,243.27200000,1728015419999,576090.20212000,1544,194.54820000,460700.39094600,0],
[1728015420000,2368.76000000,2368.77000000,2367.46000000,2367.46000000,53.08940000,1728015479999,125724.03730000,539,19.13690000,45321.11632000,0],
[1728015480000,2367.47000000,2369.25000000,2367.47000000,2369.25000000,149.27820000,1728015539999,353497.16032500,1714,78.72770000,186455.47313400,0],
[1728015540000,2369.24000000,2369.31000000,2369.05000000,2369.28000000,118.98600000,1728015599999,281893.16611600,858,92.53850000,219233.52484200,0],
[1728015600000,2369.27000000,2369.84000000,2369.11000000,2369.83000000,44.23470000,1728015659999,104808.20265100,482,25.55180000,60541.29337000,0],
[1728015660000,2369.84000000,2369.84000000,2369.44000000,2369.44000000,47.45070000,1728015719999,112441.83891700,264,18.35760000,43501.18454400,0],
[1728015720000,2369.45000000,2370.89000000,2369.45000000,2370.89000000,55.87420000,1728015779999,132439.14189800,1169,53.06010000,125767.64246400,0],
[1728015780000,2370.89000000,2371.56000000,2370.89000000,2371.51000000,71.17770000,1728015839999,168790.83855300,461,68.16160000,161638.39136200,0],
[1728015840000,2371.51000000,2373.08000000,2371.34000000,2372.70000000,86.81760000,1728015899999,205961.32695100,858,62.34180000,147897.38917200,0],
[1728015900000,2372.70000000,2374.42000000,2372.00000000,2373.96000000,83.93570000,1728015959999,199222.85335500,1436,58.37990000,138560.29859600,0],
[1728015960000,2373.96000000,2376.80000000,2373.95000000,2376.15000000,298.56280000,1728016019999,709324.93621100,2101,244.84750000,581690.01665700,0],
[1728016020000,2376.15000000,2378.36000000,2375.21000000,2377.01000000,305.27520000,1728016079999,725421.30738200,2257,266.21790000,632565.95514300,0],
[1728016080000,2377.00000000,2377.27000000,2376.63000000,2376.98000000,109.62050000,1728016139999,260580.38288900,1063,41.24720000,98046.71795300,0],
[1728016140000,2376.99000000,2377.98000000,2376.45000000,2376.91000000,228.77940000,1728016199999,543901.67968300,2056,124.51860000,296022.82341900,0],
[1728016200000,2376.91000000,2379.40000000,2376.53000000,2379.29000000,170.15200000,1728016259999,404635.57631000,1775,144.30130000,343149.21828400,0],
[1728016260000,2379.30000000,2380.00000000,2378.20000000,2379.60000000,230.24390000,1728016319999,547795.65519500,3415,169.03570000,402149.37150600,0],
[1728016320000,2379.60000000,2379.60000000,2378.20000000,2378.43000000,59.32890000,1728016379999,141121.64276900,2226,31.58330000,75121.02005800,0],
[1728016380000,2378.44000000,2380.00000000,2378.12000000,2379.99000000,146.29000000,1728016439999,348053.62350200,2210,107.34830000,255429.30572500,0],
[1728016440000,2379.99000000,2380.76000000,2379.81000000,2380.60000000,74.63640000,1728016499999,177651.98419000,1284,52.24450000,124350.54424600,0],
[1728016500000,2380.60000000,2381.40000000,2379.74000000,2380.04000000,210.03880000,1728016559999,500059.60864000,1496,117.04470000,278660.22629500,0],
[1728016560000,2380.04000000,2380.46000000,2378.01000000,2378.02000000,93.72450000,1728016619999,223026.08740700,1095,18.45870000,43920.47417100,0],
[1728016620000,2378.02000000,2378.59000000,2377.60000000,2378.52000000,48.72110000,1728016679999,115870.38082400,1729,27.81190000,66144.80053700,0],
[1728016680000,2378.51000000,2378.73000000,2377.46000000,2378.73000000,86.37950000,1728016739999,205402.56551900,765,29.07800000,69146.23116600,0],
[1728016740000,2378.72000000,2378.73000000,2377.01000000,2377.01000000,99.51390000,1728016799999,236617.92095100,912,12.71210000,30226.21479900,0],
[1728016800000,2377.00000000,2377.40000000,2376.60000000,2376.60000000,20.97860000,1728016859999,49868.80647100,476,7.57030000,17994.32968000,0],
[1728016860000,2376.61000000,2377.43000000,2376.12000000,2377.43000000,55.96860000,1728016919999,133024.02071300,882,37.81790000,89883.06481200,0],
[1728016920000,2377.43000000,2377.87000000,2377.06000000,2377.86000000,30.42660000,1728016979999,72344.46037800,817,27.32910000,64980.25250300,0],
[1728016980000,2377.86000000,2377.87000000,2376.00000000,2376.33000000,135.75050000,1728017039999,322655.36208100,1824,52.41030000,124531.73620500,0],
[1728017040000,2376.33000000,2379.37000000,2376.20000000,2379.16000000,1215.67290000,1728017099999,2890433.53425900,1967,1124.73560000,2674215.91445200,0],
[1728017100000,2379.16000000,2379.37000000,2374.60000000,2374.81000000,361.86680000,1728017159999,860386.57106000,2247,135.69160000,322675.64362400,0],
[1728017160000,2374.80000000,2374.90000000,2370.00000000,2370.91000000,166.00660000,1728017219999,393759.14499900,3206,23.85670000,56587.41123000,0],
[1728017220000,2370.91000000,2371.82000000,2370.04000000,2370.65000000,48.28140000,1728017279999,114473.15396600,1812,17.71230000,41991.88782300,0],
[1728017280000,2370.64000000,2371.17000000,2369.00000000,2369.21000000,512.91900000,1728017339999,1215568.55621400,2931,86.78800000,205654.51017700,0],
[1728017340000,2369.22000000,2370.09000000,2369.00000000,2370.01000000,612.73280000,1728017399999,1451992.45004700,2045,292.68510000,693558.44908200,0],
[1728017400000,2370.00000000,2371.85000000,2370.00000000,2370.62000000,89.93670000,1728017459999,213219.71914300,1571,53.18260000,126084.82924000,0],
[1728017460000,2370.63000000,2372.09000000,2370.63000000,2372.01000000,63.92220000,1728017519999,151605.02668300,656,54.09620000,128299.19200700,0],
[1728017520000,2372.01000000,2372.52000000,2372.00000000,2372.00000000,95.34800000,1728017579999,226192.33911400,587,66.44820000,157639.20250000,0],
[1728017580000,2372.00000000,2372.51000000,2372.00000000,2372.40000000,80.32060000,1728017639999,190534.30897700,688,69.29050000,164366.98674200,0],
[1728017640000,2372.40000000,2372.59000000,2372.00000000,2372.00000000,238.47580000,1728017699999,565675.60662200,467,20.63590000,48956.62212600,0],
[1728017700000,2372.00000000,2372.88000000,2372.00000000,2372.87000000,84.44190000,1728017759999,200326.17565900,871,56.83720000,134827.86644300,0],
[1728017760000,2372.86000000,2372.97000000,2372.60000000,2372.97000000,35.69860000,1728017819999,84703.07660300,324,20.76970000,49280.70879300,0],
[1728017820000,2372.97000000,2374.33000000,2372.97000000,2373.80000000,99.79110000,1728017879999,236888.92464200,538,61.81900000,146736.33962200,0],
[1728017880000,2373.80000000,2373.81000000,2373.72000000,2373.73000000,4.44750000,1728017939999,10557.21899200,67,0.78950000,1874.07029900,0],
[1728017940000,2373.72000000,2374.61000000,2373.72000000,2374.22000000,30.80860000,1728017999999,73140.24106900,640,24.75830000,58775.30543200,0],
[1728018000000,2374.22000000,2374.65000000,2372.28000000,2372.60000000,158.54670000,1728018059999,376327.18425200,1122,16.74610000,39746.38704100,0],
[1728018060000,2372.59000000,2373.73000000,2372.59000000,2373.39000000,47.10340000,1728018119999,111794.34609000,828,31.83810000,75564.52320200,0],
[1728018120000,2373.40000000,2373.72000000,2373.06000000,2373.07000000,30.58590000,1728018179999,72593.40082000,448,16.64180000,39498.38952900,0],
[1728018180000,2373.07000000,2374.08000000,2373.07000000,2373.97000000,36.40470000,1728018239999,86417.23609900,580,27.40570000,65055.06924800,0],
[1728018240000,2373.97000000,2373.97000000,2373.06000000,2373.07000000,22.10550000,1728018299999,52472.08761300,279,10.11840000,24018.26789200,0],
[1728018300000,2373.06000000,2373.99000000,2373.06000000,2373.11000000,85.31660000,1728018359999,202474.98685000,678,66.95660000,158900.57599700,0],
[1728018360000,2373.11000000,2374.19000000,2373.11000000,2374.19000000,100.56250000,1728018419999,238666.72826100,1118,97.14020000,230542.97418200,0],
[1728018420000,2374.19000000,2374.40000000,2373.77000000,2374.40000000,47.59710000,1728018479999,112995.12226500,401,11.81390000,28047.65559900,0],
[1728018480000,2374.42000000,2375.42000000,2374.41000000,2375.10000000,179.82300000,1728018539999,427076.96664100,511,168.73370000,400736.32068400,0],
[1728018540000,2375.10000000,2380.01000000,2375.09000000,2380.01000000,432.66280000,1728018599999,1029371.46826000,1151,368.13100000,875802.00678500,0],
[1728018600000,2380.00000000,2380.20000000,2379.20000000,2380.20000000,599.13150000,1728018659999,1425897.89267100,984,36.88880000,87777.33677900,0],
[1728018660000,2380.19000000,2380.24000000,2379.00000000,2379.61000000,140.54270000,1728018719999,334450.36067300,981,43.72980000,104063.63476600,0],
[1728018720000,2379.62000000,2379.62000000,2377.28000000,2377.72000000,114.02280000,1728018779999,271162.70724200,1247,11.83850000,28152.82899500,0],
[1728018780000,2377.72000000,2378.05000000,2377.30000000,2378.05000000,53.02690000,1728018839999,126080.41508500,541,18.65640000,44356.87109100,0],
[1728018840000,2378.05000000,2378.40000000,2378.02000000,2378.39000000,34.54370000,1728018899999,82151.87409300,319,9.99240000,23764.80142100,0],
[1728018900000,2378.40000000,2378.96000000,2378.39000000,2378.80000000,47.51070000,1728018959999,113014.30873400,577,10.01150000,23813.47293200,0],
[1728018960000,2378.80000000,2378.81000000,2377.00000000,2377.01000000,138.84660000,1728019019999,330209.12528800,862,24.03510000,57164.41221300,0],
[1728019020000,2377.00000000,2377.19000000,2376.24000000,2376.91000000,31.60710000,1728019079999,75123.34470900,459,9.71010000,23078.02155500,0],
[1728019080000,2376.99000000,2377.24000000,2376.26000000,2377.00000000,30.34460000,1728019139999,72118.37894100,745,6.44900000,15326.74616400,0],
[1728019140000,2377.00000000,2377.38000000,2376.40000000,2376.59000000,26.39050000,1728019199999,62722.95277400,422,9.32030000,22152.16129100,0],
[1728019200000,2376.60000000,2378.96000000,2376.60000000,2377.80000000,86.67720000,1728019259999,206103.51146600,702,47.80060000,113648.57698100,0],
[1728019260000,2377.80000000,2377.81000000,2376.86000000,2376.99000000,54.89110000,1728019319999,130488.81099800,352,29.56670000,70281.87054700,0],
[1728019320000,2376.98000000,2377.20000000,2375.88000000,2375.89000000,42.82090000,1728019379999,101758.98971600,367,10.21600000,24280.93402600,0],
[1728019380000,2375.88000000,2376.70000000,2375.88000000,2376.70000000,57.07670000,1728019439999,135624.03713500,247,52.25040000,124155.80909700,0],
[1728019440000,2376.70000000,2377.35000000,2376.62000000,2377.35000000,20.82130000,1728019499999,49491.36834000,354,18.15320000,43149.55455000,0],
[1728019500000,2377.35000000,2377.35000000,2375.21000000,2375.22000000,62.82420000,1728019559999,149286.37337300,400,4.14100000,9837.69255500,0],
[1728019560000,2375.22000000,2375.69000000,2375.21000000,2375.67000000,18.61460000,1728019619999,44217.48281000,215,16.68920000,39643.69714200,0],
[1728019620000,2375.67000000,2376.80000000,2375.66000000,2376.79000000,32.99590000,1728019679999,78403.16642000,198,22.76680000,54097.72247800,0],
[1728019680000,2376.80000000,2378.90000000,2376.79000000,2378.90000000,49.43050000,1728019739999,117568.94424100,724,26.11580000,62107.47161000,0],
[1728019740000,2378.89000000,2378.90000000,2378.28000000,2378.29000000,44.63370000,1728019799999,106162.78947800,302,12.52560000,29791.19657300,0],
[1728019800000,2378.28000000,2378.69000000,2377.67000000,2378.61000000,23.50350000,1728019859999,55894.05225600,307,6.05860000,14409.22322600,0],
[1728019860000,2378.61000000,2378.61000000,2377.64000000,2377.64000000,19.41490000,1728019919999,46170.19516500,214,7.82650000,18611.03259600,0],
[1728019920000,2377.65000000,2377.65000000,2376.23000000,2376.62000000,49.03030000,1728019979999,116537.40103900,584,7.72800000,18368.20020500,0],
[1728019980000,2376.64000000,2377.44000000,2376.63000000,2377.44000000,43.28070000,1728020039999,102882.39450800,352,19.28730000,45848.11149200,0],
[1728020040000,2377.44000000,2377.44000000,2376.52000000,2376.86000000,28.75320000,1728020099999,68348.83292400,337,6.98950000,16612.70630700,0],
[1728020100000,2376.86000000,2377.45000000,2376.19000000,2376.19000000,65.02270000,1728020159999,154558.69307700,611,48.56900000,115447.68265900,0],
[1728020160000,2376.19000000,2377.10000000,2376.19000000,2376.81000000,22.59750000,1728020219999,53711.04815500,342,12.21630000,29036.40316400,0],
[1728020220000,2376.81000000,2377.44000000,2376.81000000,2377.19000000,87.36100000,1728020279999,207672.36838900,280,68.18830000,162093.67658200,0],
[1728020280000,2377.18000000,2379.25000000,2377.18000000,2378.60000000,139.97700000,1728020339999,332956.23875700,629,119.39330000,283991.46874800,0],
[1728020340000,2378.61000000,2379.45000000,2378.60000000,2379.45000000,48.03750000,1728020399999,114281.27869000,336,40.71150000,96853.64998200,0],
[1728020400000,2379.45000000,2380.00000000,2379.44000000,2379.99000000,62.23590000,1728020459999,148111.77628600,323,33.27830000,79198.45163900,0],
[1728020460000,2380.00000000,2380.87000000,2380.00000000,2380.51000000,73.00500000,1728020519999,173792.08598700,626,38.36440000,91326.23835100,0],
[1728020520000,2380.51000000,2380.60000000,2379.81000000,2380.18000000,62.21140000,1728020579999,148080.97243200,772,35.90130000,85456.31767200,0],
[1728020580000,2380.18000000,2380.68000000,2380.18000000,2380.37000000,52.79640000,1728020639999,125684.35748500,282,9.13840000,21753.44224300,0],
[1728020640000,2380.38000000,2380.47000000,2380.34000000,2380.35000000,91.94030000,1728020699999,218854.03747200,391,34.13690000,81258.10797400,0],
[1728020700000,2380.36000000,2380.36000000,2379.44000000,2379.44000000,197.45210000,1728020759999,469961.09306600,2006,37.12330000,88349.82317800,0],
[1728020760000,2379.45000000,2379.45000000,2378.57000000,2378.69000000,178.00600000,1728020819999,423475.20346200,1259,138.29200000,328999.09670300,0],
[1728020820000,2378.69000000,2380.34000000,2378.69000000,2379.74000000,212.83950000,1728020879999,506540.16741800,1594,51.45140000,122416.32843900,0],
[1728020880000,2379.74000000,2383.57000000,2379.54000000,2382.57000000,413.68800000,1728020939999,985285.63806600,2079,293.45970000,698829.55161200,0],
[1728020940000,2382.57000000,2382.58000000,2381.21000000,2382.11000000,74.31680000,1728020999999,177019.33566600,1762,36.10560000,86001.98781200,0],
[1728021000000,2382.11000000,2382.11000000,2381.52000000,2381.52000000,35.69770000,1728021059999,85022.72524300,372,16.60750000,39555.03558100,0],
[1728021060000,2381.53000000,2381.89000000,2381.02000000,2381.38000000,43.34970000,1728021119999,103237.05856300,660,17.59740000,41911.49135700,0],
[1728021120000,2381.38000000,2382.50000000,2381.37000000,2382.50000000,112.84210000,1728021179999,268798.01545400,903,106.10370000,252745.40678100,0],
[1728021180000,2382.50000000,2383.18000000,2382.46000000,2383.07000000,95.92550000,1728021239999,228573.05758600,1499,63.66340000,151697.66724700,0],
[1728021240000,2383.06000000,2383.98000000,2383.06000000,2383.96000000,138.28820000,1728021299999,329628.06820700,1283,38.48060000,91720.50050600,0],
[1728021300000,2383.95000000,2385.12000000,2383.95000000,2384.67000000,156.19350000,1728021359999,372473.48016200,1750,112.24810000,267678.14291900,0],
[1728021360000,2384.67000000,2385.09000000,2383.25000000,2383.26000000,201.01780000,1728021419999,479333.39549200,1699,70.38080000,167831.22342600,0],
[1728021420000,2383.25000000,2383.66000000,2382.66000000,2383.66000000,73.34520000,1728021479999,174792.72433000,1536,54.87700000,130782.04895800,0],
[1728021480000,2383.66000000,2384.19000000,2383.50000000,2383.98000000,105.45240000,1728021539999,251376.70697800,1435,62.94790000,150053.64026900,0],
[1728021540000,2383.98000000,2383.98000000,2383.05000000,2383.34000000,88.18760000,1728021599999,210200.89965900,840,39.47380000,94086.08911600,0],
[1728021600000,2383.34000000,2384.14000000,2383.11000000,2383.27000000,131.81370000,1728021659999,314197.06079500,1405,91.65140000,218461.52743300,0],
[1728021660000,2383.26000000,2383.26000000,2381.09000000,2381.12000000,96.62560000,1728021719999,230169.86319700,2139,15.48840000,36895.84504900,0],
[1728021720000,2381.12000000,2381.42000000,2380.62000000,2381.41000000,100.49600000,1728021779999,239281.87644600,976,43.61320000,103842.35439700,0],
[1728021780000,2381.41000000,2381.41000000,2380.12000000,2380.82000000,40.22680000,1728021839999,95767.54419800,829,15.41020000,36684.11508800,0],
[1728021840000,2380.82000000,2380.90000000,2378.53000000,2378.54000000,175.28990000,1728021899999,417241.68606400,1630,43.76290000,104165.55723800,0],
[1728021900000,2378.54000000,2380.00000000,2378.54000000,2379.11000000,130.38800000,1728021959999,310268.62616200,1255,85.10850000,202529.25183600,0],
[1728021960000,2379.11000000,2379.12000000,2377.40000000,2377.80000000,82.89090000,1728022019999,197136.59680100,1615,21.17470000,50352.05518500,0],
[1728022020000,2377.80000000,2378.84000000,2377.50000000,2378.64000000,51.82380000,1728022079999,123231.70238200,1529,22.31110000,53055.42998100,0],
[1728022080000,2378.64000000,2378.80000000,2378.43000000,2378.55000000,9.50080000,1728022139999,22598.08539100,732,3.25890000,7751.58740100,0],
[1728022140000,2378.55000000,2378.80000000,2377.22000000,2377.23000000,34.85580000,1728022199999,82879.36034200,448,4.42790000,10530.93274000,0],
[1728022200000,2377.22000000,2378.44000000,2377.22000000,2378.15000000,61.90510000,1728022259999,147213.93934700,1133,42.05930000,100016.86213300,0],
[1728022260000,2378.16000000,2379.13000000,2377.80000000,2379.13000000,63.12130000,1728022319999,150132.19886000,876,27.16070000,64601.03027300,0],
[1728022320000,2379.12000000,2379.13000000,2378.08000000,2378.12000000,17.55440000,1728022379999,41754.18413200,407,8.52490000,20274.86824900,0],
[1728022380000,2378.11000000,2378.39000000,2376.88000000,2376.89000000,156.86110000,1728022439999,372956.54806600,1347,19.39110000,46109.70890300,0],
[1728022440000,2376.89000000,2377.53000000,2376.87000000,2377.40000000,128.26950000,1728022499999,304902.20230000,889,111.78490000,265715.85403800,0],
[1728022500000,2377.39000000,2378.39000000,2377.39000000,2378.39000000,28.71550000,1728022559999,68293.14580400,377,24.51920000,58313.23058100,0],
[1728022560000,2378.39000000,2381.33000000,2378.38000000,2381.12000000,187.14830000,1728022619999,445485.62178300,1575,163.69320000,389672.07970000,0],
[1728022620000,2381.12000000,2381.92000000,2381.01000000,2381.40000000,39.83750000,1728022679999,94867.96917700,1008,26.27560000,62571.98239900,0],
[1728022680000,2381.40000000,2381.40000000,2380.90000000,2380.90000000,29.12660000,1728022739999,69357.96231600,282,6.37470000,15180.53840400,0],
[1728022740000,2380.90000000,2381.28000000,2380.21000000,2380.61000000,81.68100000,1728022799999,194460.47108700,678,42.78650000,101859.60881700,0],
[1728022800000,2380.61000000,2380.92000000,2380.50000000,2380.51000000,38.83820000,1728022859999,92466.11149300,308,34.03340000,81026.95388500,0],
[1728022860000,2380.50000000,2381.26000000,2379.74000000,2380.22000000,74.00890000,1728022919999,176197.76023100,1009,40.35340000,96075.26354000,0],
[1728022920000,2380.21000000,2381.17000000,2380.21000000,2380.47000000,71.18520000,1728022979999,169481.95617400,813,25.73590000,61271.05001500,0],
[1728022980000,2380.48000000,2382.35000000,2380.47000000,2382.35000000,163.47170000,1728023039999,389306.80286900,927,98.35560000,234217.22346100,0],
[1728023040000,2382.35000000,2386.66000000,2382.34000000,2385.25000000,219.26980000,1728023099999,523036.10630700,1481,176.94610000,422055.09814200,0],
[1728023100000,2385.25000000,2387.58000000,2384.73000000,2385.40000000,125.34770000,1728023159999,299087.53995100,1691,71.00850000,169430.56266600,0],
[1728023160000,2385.40000000,2386.00000000,2385.20000000,2386.00000000,43.43550000,1728023219999,103624.63315600,809,29.06700000,69343.83568200,0],
[1728023220000,2386.00000000,2387.06000000,2385.80000000,2386.01000000,91.20030000,1728023279999,217640.97118400,1614,61.81140000,147511.10695000,0],
[1728023280000,2386.00000000,2386.99000000,2384.43000000,2384.43000000,172.86260000,1728023339999,412434.29765500,1130,68.93730000,164492.17805300,0],
[1728023340000,2384.43000000,2385.40000000,2382.15000000,2382.33000000,288.17960000,1728023399999,686887.36048400,1039,45.85010000,109322.78002500,0],
[1728023400000,2382.33000000,2384.00000000,2382.16000000,2383.77000000,121.42210000,1728023459999,289326.74678200,1113,91.64850000,218379.53114300,0],
[1728023460000,2383.78000000,2384.40000000,2383.60000000,2384.05000000,32.66250000,1728023519999,77873.06853400,412,11.34970000,27058.58067000,0],
[1728023520000,2384.05000000,2385.71000000,2384.05000000,2385.48000000,27.72370000,1728023579999,66124.90029000,485,20.88290000,49808.18248000,0],
[1728023580000,2385.47000000,2386.28000000,2384.95000000,2385.71000000,50.05440000,1728023639999,119415.40204100,805,26.34370000,62849.70158700,0],
[1728023640000,2385.71000000,2385.91000000,2383.48000000,2384.24000000,107.10320000,1728023699999,255474.50184800,1194,17.37460000,41439.39808900,0],
[1728023700000,2384.24000000,2384.24000000,2383.30000000,2383.49000000,110.44750000,1728023759999,263307.71677200,1854,59.91080000,142830.93803500,0],
[1728023760000,2383.48000000,2383.48000000,2381.80000000,2382.39000000,82.73730000,1728023819999,197124.78552300,1155,14.63600000,34869.50397100,0],
[1728023820000,2382.40000000,2382.40000000,2381.51000000,2381.60000000,52.51820000,1728023879999,125086.22734900,1779,20.00440000,47643.89687200,0],
[1728023880000,2381.60000000,2381.91000000,2381.00000000,2381.00000000,25.14620000,1728023939999,59886.80561500,543,6.77350000,16131.65430800,0],
[1728023940000,2381.00000000,2381.45000000,2381.00000000,2381.34000000,22.54220000,1728023999999,53680.77179300,568,16.62090000,39580.14895000,0],
[1728024000000,2381.34000000,2381.34000000,2381.29000000,2381.30000000,34.09370000,1728024059999,81187.90687200,131,13.78530000,32827.45588400,0],
[1728024060000,2381.29000000,2381.30000000,2380.82000000,2380.82000000,61.11330000,1728024119999,145520.93914700,198,15.86830000,37787.11763000,0],
[1728024120000,2380.83000000,2381.16000000,2379.30000000,2379.58000000,72.41280000,1728024179999,172337.37291600,1208,18.62060000,44318.26667000,0],
[1728024180000,2379.58000000,2380.86000000,2379.57000000,2379.81000000,51.36570000,1728024239999,122262.90388100,1384,33.02190000,78599.18057000,0],
[1728024240000,2379.81000000,2380.20000000,2379.12000000,2379.65000000,62.09130000,1728024299999,147753.04782700,1306,32.40490000,77114.03797400,0],
[1728024300000,2379.65000000,2380.30000000,2379.44000000,2379.62000000,54.21890000,1728024359999,129030.09483600,1746,37.16080000,88432.89847600,0],
[1728024360000,2379.62000000,2379.62000000,2378.10000000,2378.10000000,83.34740000,1728024419999,198261.11746500,644,16.58970000,39459.83122300,0],
[1728024420000,2378.11000000,2379.58000000,2377.02000000,2379.58000000,82.87780000,1728024479999,197087.05592800,1446,33.74930000,80269.76111500,0],
[1728024480000,2379.58000000,2379.80000000,2379.27000000,2379.80000000,46.25230000,1728024539999,110064.17343800,719,14.06970000,33481.15193400,0],
[1728024540000,2379.80000000,2380.86000000,2379.80000000,2380.55000000,64.99610000,1728024599999,154713.27621400,873,54.45210000,129611.97727000,0],
[1728024600000,2380.55000000,2381.00000000,2380.03000000,2380.03000000,33.71880000,1728024659999,80266.74375200,893,15.65370000,37265.82611800,0],
[1728024660000,2380.03000000,2380.03000000,2378.50000000,2379.35000000,68.74660000,1728024719999,163541.65657100,1451,37.79950000,89913.80014800,0],
[1728024720000,2379.36000000,2379.36000000,2377.52000000,2378.50000000,48.64630000,1728024779999,115687.25029000,1389,26.04670000,61939.69701300,0],
[1728024780000,2378.53000000,2378.53000000,2378.13000000,2378.13000000,17.88320000,1728024839999,42531.77577400,186,10.90050000,25925.31859300,0],
[1728024840000,2378.13000000,2378.23000000,2377.43000000,2377.53000000,30.28960000,1728024899999,72022.64872200,871,12.27630000,29189.18159700,0],
[1728024900000,2377.53000000,2377.57000000,2376.27000000,2376.30000000,32.19720000,1728024959999,76538.52806200,647,5.47790000,13023.98131600,0],
[1728024960000,2376.31000000,2376.50000000,2375.00000000,2376.00000000,480.90770000,1728025019999,1142659.33267300,1577,46.89940000,111425.01370600,0],
[1728025020000,2376.00000000,2376.01000000,2374.97000000,2374.99000000,450.11420000,1728025079999,1069223.29154300,1467,79.94250000,189877.41973600,0],
[1728025080000,2374.98000000,2375.28000000,2374.30000000,2374.98000000,182.14240000,1728025139999,432573.45377000,1874,70.32440000,166999.73714400,0],
[1728025140000,2374.97000000,2375.20000000,2374.55000000,2374.97000000,160.64390000,1728025199999,381530.59182000,1075,113.11090000,268635.51279200,0],
[1728025200000,2374.96000000,2374.96000000,2372.73000000,2372.79000000,190.83770000,1728025259999,453032.54283300,3814,67.37930000,159952.46870100,0],
[1728025260000,2372.79000000,2373.49000000,2371.81000000,2372.88000000,126.10130000,1728025319999,299212.19405500,3257,55.19330000,130967.87208100,0],
[1728025320000,2372.88000000,2374.17000000,2372.88000000,2372.96000000,38.57110000,1728025379999,91549.91309600,1956,15.04950000,35719.42660600,0],
[1728025380000,2372.96000000,2374.56000000,2372.84000000,2374.04000000,70.24160000,1728025439999,166748.81735700,2603,52.60470000,124878.11236100,0],
[1728025440000,2374.05000000,2375.60000000,2374.04000000,2374.31000000,250.72460000,1728025499999,595512.47966000,1819,61.12070000,145158.72011300,0],
[1728025500000,2374.30000000,2375.39000000,2373.36000000,2375.00000000,146.08640000,1728025559999,346940.82970300,1930,44.40550000,105446.94610800,0],
[1728025560000,2375.00000000,2375.19000000,2374.00000000,2374.90000000,194.25330000,1728025619999,461271.17226000,844,50.85040000,120737.57652200,0],
[1728025620000,2374.91000000,2375.40000000,2374.58000000,2374.98000000,222.31660000,1728025679999,528022.78148400,1244,113.67470000,269976.17353100,0],
[1728025680000,2374.98000000,2375.67000000,2374.85000000,2374.99000000,156.13140000,1728025739999,370855.53590800,604,57.03290000,135457.68545100,0],
[1728025740000,2375.00000000,2375.23000000,2374.41000000,2374.42000000,191.64170000,1728025799999,455136.11614900,1102,53.32460000,126627.67060000,0],
[1728025800000,2374.42000000,2374.42000000,2370.90000000,2372.79000000,85.26600000,1728025859999,202261.35728100,3222,35.39010000,83943.80034300,0],
[1728025860000,2372.80000000,2374.94000000,2372.80000000,2374.79000000,43.97990000,1728025919999,104432.00110300,1400,22.20940000,52732.66425200,0],
[1728025920000,2374.80000000,2375.74000000,2374.31000000,2374.95000000,362.47160000,1728025979999,860901.22152400,1892,166.66400000,395837.52224900,0],
[1728025980000,2374.95000000,2375.37000000,2373.73000000,2373.74000000,424.77980000,1728026039999,1008841.80893100,2256,69.25040000,164468.59590700,0],
[1728026040000,2373.73000000,2375.60000000,2373.73000000,2375.60000000,63.48930000,1728026099999,150774.72813600,603,20.23180000,48048.16784300,0],
[1728026100000,2375.59000000,2376.27000000,2375.56000000,2376.08000000,39.19290000,1728026159999,93118.16603600,431,17.76460000,42205.31493400,0],
[1728026160000,2376.09000000,2376.60000000,2375.02000000,2376.60000000,53.87660000,1728026219999,128008.61233000,1797,24.91000000,59188.14646600,0],
[1728026220000,2376.59000000,2378.40000000,2376.59000000,2377.59000000,218.96700000,1728026279999,520595.28233000,1278,184.67850000,439064.52495400,0],
[1728026280000,2377.59000000,2377.65000000,2376.60000000,2377.04000000,96.27230000,1728026339999,228871.54310500,929,19.65000000,46705.95262900,0],
[1728026340000,2377.03000000,2377.19000000,2376.30000000,2376.31000000,75.69380000,1728026399999,179901.09764200,359,8.70950000,20699.50524800,0],
[1728026400000,2376.31000000,2377.40000000,2376.30000000,2377.06000000,56.30770000,1728026459999,133839.93305400,1744,34.44720000,81873.26641900,0],
[1728026460000,2377.06000000,2377.59000000,2376.77000000,2377.59000000,57.13960000,1728026519999,135833.37771600,1534,44.15190000,104958.31652600,0],
[1728026520000,2377.59000000,2380.45000000,2377.59000000,2380.16000000,169.06210000,1728026579999,402303.13296500,1244,136.97370000,325973.32332800,0],
[1728026580000,2380.16000000,2381.00000000,2379.93000000,2381.00000000,50.26150000,1728026639999,119632.84405900,1324,44.37010000,105608.02917300,0],
[1728026640000,2380.99000000,2382.81000000,2380.99000000,2381.97000000,104.55570000,1728026699999,249036.21931100,876,73.11420000,174141.50933400,0],
[1728026700000,2381.98000000,2384.47000000,2381.97000000,2383.70000000,78.78010000,1728026759999,187761.79436500,1356,62.34680000,148589.91962900,0],
[1728026760000,2383.70000000,2385.57000000,2383.70000000,2384.88000000,170.65780000,1728026819999,406988.57367700,1500,135.03740000,322032.65113200,0],
[1728026820000,2384.88000000,2384.88000000,2383.00000000,2383.10000000,135.29920000,1728026879999,322553.40532700,967,54.17540000,129151.02552800,0],
[1728026880000,2383.10000000,2383.86000000,2382.55000000,2382.80000000,103.49800000,1728026939999,246687.87894200,1316,26.60810000,63413.23988600,0],
[1728026940000,2382.80000000,2382.80000000,2381.81000000,2381.82000000,48.07520000,1728026999999,114537.98298600,503,17.04570000,40612.23048100,0],
[1728027000000,2381.82000000,2383.09000000,2381.82000000,2383.09000000,175.50440000,1728027059999,418143.72438100,1672,154.05630000,367041.44427700,0],
[1728027060000,2383.09000000,2383.09000000,2380.21000000,2380.26000000,173.30380000,1728027119999,412756.13406700,1511,101.45690000,241655.54669300,0],
[1728027120000,2380.26000000,2381.00000000,2380.26000000,2381.00000000,108.70390000,1728027179999,258786.40791000,1334,94.08530000,223983.92299500,0],
[1728027180000,2381.00000000,2381.40000000,2380.25000000,2381.40000000,184.52940000,1728027239999,439295.41763100,645,123.44000000,293871.49592100,0],
[1728027240000,2381.40000000,2382.65000000,2381.40000000,2382.62000000,174.62010000,1728027299999,415949.72658900,734,163.74730000,390049.84337400,0],
[1728027300000,2382.62000000,2383.40000000,2382.02000000,2383.39000000,105.33280000,1728027359999,250967.55327200,1053,77.94190000,185706.92882100,0],
[1728027360000,2383.40000000,2384.00000000,2382.68000000,2382.69000000,92.83310000,1728027419999,221251.29724700,778,76.18120000,181563.81949000,0],
[1728027420000,2382.69000000,2383.60000000,2382.68000000,2383.16000000,104.19980000,1728027479999,248317.15403400,695,67.71480000,161361.83253800,0],
[1728027480000,2383.17000000,2383.47000000,2382.69000000,2382.85000000,129.67100000,1728027539999,308991.33994900,581,117.64010000,280322.12147100,0],
[1728027540000,2382.85000000,2383.05000000,2382.61000000,2382.71000000,89.07510000,1728027599999,212256.66958400,454,66.90610000,159431.71790500,0],
[1728027600000,2382.71000000,2382.71000000,2381.28000000,2381.60000000,152.46140000,1728027659999,363152.15345900,1135,63.53310000,151339.21412000,0],
[1728027660000,2381.60000000,2382.23000000,2381.59000000,2382.22000000,120.63210000,1728027719999,287330.48031600,428,113.41470000,270137.36081400,0],
[1728027720000,2382.23000000,2382.23000000,2381.55000000,2382.04000000,96.17110000,1728027779999,229068.90626000,631,73.13990000,174208.62791900,0],
[1728027780000,2382.04000000,2382.56000000,2381.89000000,2381.90000000,108.35940000,1728027839999,258140.02888700,505,84.46640000,201219.57019000,0],
[1728027840000,2381.90000000,2383.61000000,2381.90000000,2383.61000000,147.15040000,1728027899999,350615.22961200,902,118.22460000,281696.24907900,0],
[1728027900000,2383.61000000,2384.74000000,2383.00000000,2384.74000000,110.57760000,1728027959999,263574.52554700,1299,80.24260000,191266.62281900,0],
[1728027960000,2384.74000000,2384.74000000,2383.41000000,2383.41000000,175.00830000,1728028019999,417258.82318500,948,90.98700000,216925.93067200,0],
[1728028020000,2383.42000000,2385.00000000,2383.42000000,2383.71000000,150.89530000,1728028079999,359784.48520200,1322,96.09960000,229133.77121100,0],
[1728028080000,2383.71000000,2384.67000000,2383.70000000,2384.48000000,149.44930000,1728028139999,356303.85881200,1387,89.84440000,214189.18864800,0],
[1728028140000,2384.48000000,2384.49000000,2381.55000000,2381.56000000,132.30450000,1728028199999,315391.99587300,657,84.30210000,200983.17897700,0],
[1728028200000,2381.56000000,2386.28000000,2381.56000000,2385.54000000,249.42680000,1728028259999,594631.15347300,3264,190.88480000,454996.13842200,0],
[1728028260000,2385.54000000,2385.66000000,2384.60000000,2385.66000000,177.23370000,1728028319999,422730.47536100,2087,137.09850000,327002.15146900,0],
[1728028320000,2385.66000000,2386.12000000,2383.58000000,2384.44000000,491.12660000,1728028379999,1171080.03451600,1506,130.27360000,310715.80411100,0],
[1728028380000,2384.44000000,2384.51000000,2382.96000000,2383.76000000,243.24410000,1728028439999,579768.91765600,1281,83.64070000,199380.72872100,0],
[1728028440000,2383.76000000,2384.28000000,2383.52000000,2384.27000000,123.29940000,1728028499999,293943.63929300,2074,102.81960000,245119.11238200,0],
[1728028500000,2384.28000000,2384.28000000,2381.00000000,2381.76000000,149.96620000,1728028559999,357358.03634800,1651,61.78680000,147245.06503400,0],
[1728028560000,2381.76000000,2381.82000000,2381.10000000,2381.40000000,184.43160000,1728028619999,439252.47237500,1660,67.81000000,161494.69951400,0],
[1728028620000,2381.40000000,2381.80000000,2381.36000000,2381.64000000,355.03000000,1728028679999,845520.60065300,1453,276.10490000,657546.45992200,0],
[1728028680000,2381.64000000,2382.15000000,2381.37000000,2381.88000000,130.91760000,1728028739999,311813.57335100,1237,92.75360000,220915.39305500,0],
[1728028740000,2381.89000000,2381.89000000,2380.56000000,2381.60000000,213.84910000,1728028799999,509281.09905100,1084,64.99750000,154789.70653200,0],
[1728028800000,2381.60000000,2382.46000000,2381.60000000,2381.62000000,103.79470000,1728028859999,247234.05690000,682,71.37080000,170000.07457300,0],
[1728028860000,2381.61000000,2381.61000000,2380.30000000,2380.50000000,117.86250000,1728028919999,280632.59438300,718,52.62970000,125308.02724000,0],
[1728028920000,2380.50000000,2380.50000000,2379.51000000,2379.84000000,258.70410000,1728028979999,615717.28742500,678,49.50760000,117823.54116100,0],
[1728028980000,2379.84000000,2379.84000000,2378.77000000,2379.17000000,128.04350000,1728029039999,304660.20764600,961,47.93090000,114048.78316400,0],
[1728029040000,2379.18000000,2380.14000000,2379.17000000,2380.12000000,182.25190000,1728029099999,433726.99555900,488,166.82900000,397028.97313300,0],
[1728029100000,2380.13000000,2380.92000000,2378.83000000,2379.36000000,204.61690000,1728029159999,486957.07205700,808,113.95240000,271210.28645900,0],
[1728029160000,2379.37000000,2379.63000000,2379.24000000,2379.63000000,113.59970000,1728029219999,270308.07145300,371,91.76180000,218344.21284600,0],
[1728029220000,2379.62000000,2379.63000000,2378.04000000,2379.14000000,136.41310000,1728029279999,324489.67588500,875,83.71680000,199131.89082900,0],
[1728029280000,2379.16000000,2380.71000000,2379.16000000,2380.71000000,101.05050000,1728029339999,240499.41687500,373,92.78250000,220821.37253400,0],
[1728029340000,2380.71000000,2383.24000000,2380.71000000,2382.41000000,468.18230000,1728029399999,1115209.66343100,1099,375.08970000,893445.15626100,0],
[1728029400000,2382.40000000,2383.25000000,2382.22000000,2383.02000000,135.27140000,1728029459999,322328.59919000,1342,75.49680000,179896.03105000,0],
[1728029460000,2383.01000000,2384.02000000,2381.76000000,2383.39000000,310.32240000,1728029519999,739556.45339200,1656,252.84430000,602577.83953100,0],
[1728029520000,2383.39000000,2384.10000000,2383.39000000,2383.72000000,159.24400000,1728029579999,379605.74944600,721,126.04410000,300461.31861100,0],
[1728029580000,2383.72000000,2384.19000000,2382.61000000,2383.00000000,135.06560000,1728029639999,321967.63511700,1591,80.08040000,190897.28339300,0],
[1728029640000,2383.00000000,2384.68000000,2382.99000000,2384.68000000,223.80400000,1728029699999,533490.77636600,1556,133.24400000,317609.72889000,0],
[1728029700000,2384.67000000,2384.68000000,2381.90000000,2382.71000000,211.12810000,1728029759999,503223.96308900,1161,81.67320000,194667.67093300,0],
[1728029760000,2382.72000000,2382.76000000,2382.36000000,2382.51000000,84.20240000,1728029819999,200623.18195000,253,14.95410000,35631.33995800,0],
[1728029820000,2382.51000000,2382.91000000,2382.50000000,2382.50000000,53.49890000,1728029879999,127467.72603400,378,34.83160000,82989.97445200,0],
[1728029880000,2382.51000000,2386.91000000,2382.51000000,2386.64000000,129.08780000,1728029939999,307925.96309500,1510,111.57220000,266134.13117000,0],
[1728029940000,2386.65000000,2391.51000000,2385.94000000,2390.80000000,632.49010000,1728029999999,1510994.04684900,3947,458.90270000,1096271.91891800,0],
[1728030000000,2390.80000000,2390.80000000,2389.41000000,2389.62000000,136.38350000,1728030059999,325957.41042900,2170,62.60790000,149627.52828400,0],
[1728030060000,2389.61000000,2390.36000000,2388.50000000,2390.25000000,235.89620000,1728030119999,563573.47902700,2585,177.72160000,424576.66189300,0],
[1728030120000,2390.29000000,2390.98000000,2390.14000000,2390.80000000,90.81170000,1728030179999,217091.79208200,1657,42.45930000,101495.42817900,0],
[1728030180000,2390.79000000,2393.33000000,2390.79000000,2392.43000000,338.32100000,1728030239999,809297.37155800,1795,215.07250000,514420.05389500,0],
[1728030240000,2392.42000000,2393.52000000,2392.01000000,2392.39000000,324.51560000,1728030299999,776497.21743600,3016,174.53940000,417616.86202300,0],
[1728030300000,2392.39000000,2393.52000000,2392.01000000,2392.40000000,169.07910000,1728030359999,404531.73596000,2117,114.93850000,274992.84078000,0],
[1728030360000,2392.41000000,2392.41000000,2389.80000000,2389.81000000,100.75590000,1728030419999,240936.29196300,810,39.79190000,95160.94713700,0],
[1728030420000,2389.81000000,2392.81000000,2389.81000000,2392.75000000,173.41200000,1728030479999,414716.60465500,1698,125.46130000,300078.59012600,0],
[1728030480000,2392.66000000,2392.66000000,2390.00000000,2390.52000000,149.99800000,1728030539999,358665.18731100,1233,30.84980000,73759.54945100,0],
[1728030540000,2390.53000000,2391.35000000,2389.01000000,2389.23000000,146.53740000,1728030599999,350270.17989000,1048,84.75770000,202574.76463800,0],
[1728030600000,2389.23000000,2390.54000000,2389.22000000,2390.54000000,53.56340000,1728030659999,128023.74716600,1164,39.60770000,94666.75897200,0],
[1728030660000,2390.54000000,2390.88000000,2388.00000000,2388.36000000,328.00240000,1728030719999,783976.33141600,1556,76.04150000,181748.51424900,0],
[1728030720000,2388.36000000,2390.76000000,2388.36000000,2390.51000000,231.50900000,1728030779999,553237.88979500,1611,214.33790000,512208.38851300,0],
[1728030780000,2390.52000000,2390.83000000,2389.20000000,2389.62000000,91.53760000,1728030839999,218800.46964800,1924,43.93980000,105021.88083700,0],
[1728030840000,2389.62000000,2390.50000000,2389.20000000,2390.50000000,82.02010000,1728030899999,196016.18147900,2296,41.01920000,98025.02797800,0],
[1728030900000,2390.50000000,2390.92000000,2389.89000000,2390.61000000,129.79270000,1728030959999,310271.52707500,1402,35.73440000,85420.87686900,0],
[1728030960000,2390.60000000,2392.33000000,2390.34000000,2391.86000000,780.16070000,1728031019999,1865434.62993800,2028,727.70370000,1739970.78207000,0],
[1728031020000,2391.86000000,2391.86000000,2390.42000000,2391.40000000,186.67110000,1728031079999,446340.11229200,1408,49.78960000,119039.92127700,0],
[1728031080000,2391.40000000,2392.73000000,2390.57000000,2390.57000000,357.28730000,1728031139999,854598.18902900,2489,163.26520000,390495.78485000,0],
[1728031140000,2390.58000000,2391.00000000,2389.25000000,2389.26000000,264.38340000,1728031199999,631860.12807700,1544,142.27700000,340012.70133900,0],
[1728031200000,2389.26000000,2391.17000000,2389.25000000,2389.83000000,104.98710000,1728031259999,250933.83357200,2318,75.97780000,181590.96516600,0],
[1728031260000,2389.84000000,2390.43000000,2389.50000000,2389.83000000,110.85590000,1728031319999,264946.12161400,1419,53.46360000,127774.29548100,0],
[1728031320000,2389.83000000,2391.00000000,2389.83000000,2390.73000000,255.61610000,1728031379999,611061.62157900,998,108.06180000,258312.39821700,0],
[1728031380000,2390.73000000,2391.00000000,2389.26000000,2389.27000000,76.30910000,1728031439999,182365.60285300,880,25.63360000,61264.44877100,0],
[1728031440000,2389.27000000,2389.56000000,2388.09000000,2388.09000000,50.76030000,1728031499999,121262.53042200,1404,11.95810000,28569.80981000,0],
[1728031500000,2388.09000000,2388.40000000,2385.60000000,2385.80000000,145.02270000,1728031559999,346122.21682400,3948,48.40860000,115539.65769700,0],
[1728031560000,2385.80000000,2386.99000000,2384.80000000,2386.12000000,270.49070000,1728031619999,645224.78157100,3335,80.64760000,192357.20028800,0],
[1728031620000,2386.15000000,2386.39000000,2384.64000000,2386.37000000,107.16250000,1728031679999,255646.64133800,1733,78.03680000,186158.73053400,0],
[1728031680000,2386.37000000,2387.50000000,2386.37000000,2387.50000000,63.43200000,1728031739999,151403.20602000,571,18.97520000,45292.46273000,0],
[1728031740000,2387.60000000,2387.65000000,2385.20000000,2385.96000000,106.94030000,1728031799999,255217.45544800,2699,30.78780000,73476.61504700,0],
[1728031800000,2385.96000000,2386.67000000,2385.05000000,2385.13000000,123.48450000,1728031859999,294578.03256900,2647,31.92590000,76161.57286700,0],
[1728031860000,2385.13000000,2385.60000000,2384.40000000,2384.61000000,70.77390000,1728031919999,168783.46952200,1691,28.92320000,68976.65377600,0],
[1728031920000,2384.62000000,2384.62000000,2383.01000000,2383.30000000,104.67110000,1728031979999,249492.49533100,1180,20.83250000,49655.26617300,0],
[1728031980000,2383.30000000,2383.30000000,2382.50000000,2383.18000000,60.44820000,1728032039999,144037.64526600,1232,15.26700000,36380.01603000,0],
[1728032040000,2383.19000000,2383.45000000,2382.99000000,2383.00000000,54.75190000,1728032099999,130487.14845800,460,31.19620000,74347.81628300,0],
[1728032100000,2383.00000000,2383.00000000,2381.22000000,2381.45000000,168.52030000,1728032159999,401463.70776900,1120,62.61700000,149167.18915700,0],
[1728032160000,2381.46000000,2381.77000000,2380.92000000,2381.51000000,27.59160000,1728032219999,65705.47607700,907,13.19840000,31430.69810200,0],
[1728032220000,2381.50000000,2381.77000000,2381.39000000,2381.77000000,43.24560000,1728032279999,102987.33824100,604,34.55180000,82283.06193000,0],
[1728032280000,2381.77000000,2382.39000000,2381.76000000,2382.38000000,65.48800000,1728032339999,155993.13512300,635,53.44060000,127297.49407800,0],
[1728032340000,2382.38000000,2382.39000000,2381.50000000,2381.51000000,43.89050000,1728032399999,104544.30749800,405,11.87610000,28287.27482400,0],
[1728032400000,2381.51000000,2381.66000000,2381.20000000,2381.21000000,38.29720000,1728032459999,91199.74168600,536,13.84720000,32976.07543900,0],
[1728032460000,2381.21000000,2382.98000000,2381.21000000,2382.98000000,43.02650000,1728032519999,102480.60321500,2095,33.36590000,79470.05630500,0],
[1728032520000,2382.97000000,2383.97000000,2382.10000000,2382.11000000,232.40280000,1728032579999,553923.11688800,1096,195.26440000,465408.63715800,0],
[1728032580000,2382.10000000,2382.11000000,2381.60000000,2382.11000000,65.77180000,1728032639999,156652.77982800,626,43.54810000,103719.79638600,0],
[1728032640000,2382.11000000,2382.60000000,2381.24000000,2381.81000000,297.32020000,1728032699999,708155.53514200,1480,217.31380000,517590.47694800,0],
[1728032700000,2381.81000000,2384.07000000,2381.81000000,2384.00000000,83.21350000,1728032759999,198300.63088300,1557,56.26320000,134067.87473200,0],
[1728032760000,2384.00000000,2385.40000000,2382.83000000,2384.01000000,102.65250000,1728032819999,244753.65829600,1339,69.30780000,165252.96328300,0],
[1728032820000,2384.01000000,2384.10000000,2383.31000000,2383.60000000,173.06910000,1728032879999,412543.30875500,702,23.26190000,55449.25147200,0],
[1728032880000,2383.59000000,2384.25000000,2383.30000000,2383.90000000,41.29670000,1728032939999,98452.63118100,622,22.71740000,54159.94963600,0],
[1728032940000,2383.90000000,2384.46000000,2383.89000000,2384.26000000,16.05720000,1728032999999,38284.76608800,336,7.29360000,17389.61529600,0],
[1728033000000,2384.25000000,2387.40000000,2384.01000000,2387.40000000,136.66260000,1728033059999,325956.28117600,2610,122.32740000,291773.83309200,0],
[1728033060000,2387.39000000,2387.40000000,2384.10000000,2384.11000000,199.76010000,1728033119999,476614.00543200,1945,48.56560000,115859.40610300,0],
[1728033120000,2384.11000000,2385.00000000,2384.10000000,2384.39000000,82.18240000,1728033179999,195958.95409400,1078,30.47930000,72672.01907000,0],
[1728033180000,2384.39000000,2386.47000000,2384.39000000,2386.46000000,22.54660000,1728033239999,53779.80794800,1033,13.77620000,32861.00439700,0],
[1728033240000,2386.47000000,2386.47000000,2384.75000000,2384.75000000,115.74480000,1728033299999,276088.95065400,1104,20.38770000,48634.25448200,0],
[1728033300000,2384.75000000,2384.80000000,2383.49000000,2384.68000000,64.21130000,1728033359999,153107.65925500,1595,29.82390000,71111.79851800,0],
[1728033360000,2384.68000000,2386.91000000,2384.68000000,2386.91000000,75.19310000,1728033419999,179412.24469400,1958,31.97880000,76302.57363500,0],
[1728033420000,2386.91000000,2387.82000000,2385.62000000,2385.83000000,204.84830000,1728033479999,488937.76836100,1237,44.93880000,107272.34243400,0],
[1728033480000,2385.83000000,2386.15000000,2385.01000000,2385.15000000,143.60720000,1728033539999,342585.24997500,1677,96.86130000,231074.80069900,0],
[1728033540000,2385.14000000,2385.48000000,2382.80000000,2385.08000000,199.94890000,1728033599999,476659.84920000,1754,117.02300000,278914.72742500,0],
[1728033600000,2385.08000000,2385.09000000,2383.29000000,2383.63000000,46.53620000,1728033659999,110939.80853000,2288,20.13710000,48001.85526600,0],
[1728033660000,2383.63000000,2383.63000000,2382.83000000,2382.94000000,87.41320000,1728033719999,208336.47173700,1540,26.77170000,63803.20833700,0],
[1728033720000,2382.94000000,2383.30000000,2381.80000000,2381.80000000,47.00890000,1728033779999,111998.01163700,918,28.77600000,68559.91614900,0],
[1728033780000,2381.81000000,2382.60000000,2381.81000000,2382.60000000,66.72920000,1728033839999,158977.63503000,367,31.89620000,75986.12983200,0],
[1728033840000,2382.59000000,2382.60000000,2382.15000000,2382.41000000,101.91600000,1728033899999,242807.34278200,962,44.35990000,105682.46711900,0],
[1728033900000,2382.42000000,2383.15000000,2381.45000000,2382.65000000,117.77310000,1728033959999,280548.97326900,2597,72.88330000,173614.20218400,0],
[1728033960000,2382.65000000,2382.65000000,2381.00000000,2381.00000000,51.45120000,1728034019999,122549.39881300,1284,14.21870000,33867.87030500,0],
[1728034020000,2381.00000000,2382.00000000,2380.53000000,2381.99000000,140.57030000,1728034079999,334741.38380700,1315,55.81100000,132911.25636800,0],
[1728034080000,2381.99000000,2383.34000000,2381.99000000,2382.80000000,34.53770000,1728034139999,82298.37357200,1917,22.01580000,52460.05092400,0],
[1728034140000,2382.80000000,2382.80000000,2382.07000000,2382.21000000,51.34920000,1728034199999,122327.99564300,560,10.68270000,25448.29431600,0],
[1728034200000,2382.20000000,2382.86000000,2381.17000000,2381.87000000,106.32750000,1728034259999,253261.75784900,2844,79.24490000,188748.09065100,0],
[1728034260000,2381.88000000,2382.39000000,2381.50000000,2381.50000000,46.64920000,1728034319999,111115.07443400,1897,18.46520000,43984.85366400,0],
[1728034320000,2381.50000000,2381.50000000,2380.50000000,2380.68000000,62.41050000,1728034379999,148594.10060900,1750,28.80900000,68590.81452700,0],
[1728034380000,2380.68000000,2381.00000000,2380.27000000,2380.45000000,58.90400000,1728034439999,140233.86264500,1579,14.39540000,34270.79238500,0],
[1728034440000,2380.45000000,2380.46000000,2380.11000000,2380.46000000,123.74660000,1728034499999,294551.77173300,663,60.76220000,144632.44904200,0],
[1728034500000,2380.46000000,2380.82000000,2378.64000000,2378.65000000,125.20250000,1728034559999,297965.38154300,1492,15.34020000,36516.53101900,0],
[1728034560000,2378.64000000,2379.20000000,2378.10000000,2379.20000000,65.67130000,1728034619999,156201.84790600,2099,37.91200000,90174.71292200,0],
[1728034620000,2379.22000000,2379.54000000,2378.60000000,2379.53000000,162.09970000,1728034679999,385682.19132300,1342,102.76120000,244496.05221400,0],
[1728034680000,2379.53000000,2382.03000000,2379.53000000,2382.01000000,181.89780000,1728034739999,433052.88863100,1057,159.80040000,380457.57186400,0],
[1728034740000,2382.02000000,2383.01000000,2381.20000000,2382.52000000,385.05350000,1728034799999,917372.77188600,1377,245.17910000,584127.23691400,0],
[1728034800000,2382.53000000,2383.59000000,2382.52000000,2383.24000000,91.87840000,1728034859999,218960.67043500,1603,48.37670000,115285.02142300,0],
[1728034860000,2383.23000000,2383.24000000,2382.70000000,2382.93000000,48.48880000,1728034919999,115545.85511900,459,4.51370000,10755.25599800,0],
[1728034920000,2382.93000000,2382.93000000,2381.08000000,2381.08000000,88.49950000,1728034979999,210839.36344400,1483,8.92960000,21275.83374200,0],
[1728034980000,2381.09000000,2381.09000000,2379.48000000,2380.40000000,85.23590000,1728035039999,202886.03771300,1591,32.04900000,76284.67090900,0],
[1728035040000,2380.40000000,2381.06000000,2379.20000000,2379.96000000,178.68690000,1728035099999,425370.94956000,891,70.80730000,168562.69625400,0],
[1728035100000,2379.96000000,2381.23000000,2379.96000000,2381.22000000,106.59640000,1728035159999,253760.37532000,679,40.75230000,97011.24903600,0],
[1728035160000,2381.23000000,2381.23000000,2380.02000000,2380.37000000,60.12380000,1728035219999,143117.86196800,1111,15.19530000,36168.97991800,0],
[1728035220000,2380.37000000,2380.38000000,2378.35000000,2378.36000000,129.85060000,1728035279999,308918.75906600,1531,35.30820000,83992.76570600,0],
[1728035280000,2378.35000000,2378.60000000,2377.01000000,2377.60000000,286.38720000,1728035339999,681005.44804400,1951,64.92700000,154381.62244900,0],
[1728035340000,2377.60000000,2378.17000000,2377.00000000,2378.16000000,121.85440000,1728035399999,289707.11285500,833,43.13420000,102551.60702800,0],
[1728035400000,2378.16000000,2378.19000000,2376.80000000,2377.02000000,152.50420000,1728035459999,362599.74227000,1320,60.41170000,143632.86346300,0],
[1728035460000,2377.02000000,2377.15000000,2375.00000000,2375.20000000,204.15920000,1728035519999,485080.43183600,1425,18.69640000,44419.68405500,0],
[1728035520000,2375.20000000,2375.98000000,2374.48000000,2375.97000000,119.91580000,1728035579999,284826.56289400,2817,61.18980000,145334.23709500,0],
[1728035580000,2375.98000000,2377.40000000,2375.98000000,2376.60000000,448.54740000,1728035639999,1065996.61540400,1351,188.75160000,448539.17275000,0],
[1728035640000,2376.60000000,2376.83000000,2376.29000000,2376.39000000,92.60650000,1728035699999,220083.63496300,480,55.62310000,132188.80091100,0],
[1728035700000,2376.39000000,2377.26000000,2376.10000000,2377.25000000,271.75450000,1728035759999,645915.96568700,1144,96.57620000,229531.42313800,0],
[1728035760000,2377.25000000,2377.77000000,2376.58000000,2377.77000000,203.83080000,1728035819999,484473.12603400,888,185.08240000,439904.49182400,0],
[1728035820000,2377.80000000,2378.00000000,2377.08000000,2377.08000000,24.79980000,1728035879999,58959.85778800,588,7.59650000,18060.21120300,0],
[1728035880000,2377.09000000,2378.12000000,2377.08000000,2377.48000000,21.80320000,1728035939999,51838.45518400,734,8.36970000,19898.94108700,0],
[1728035940000,2377.48000000,2377.48000000,2377.10000000,2377.15000000,26.06160000,1728035999999,61956.80169000,1093,3.22490000,7666.41997900,0],
[1728036000000,2377.15000000,2377.93000000,2377.00000000,2377.93000000,50.73270000,1728036059999,120612.10857800,796,14.03310000,33364.11822500,0],
[1728036060000,2377.93000000,2377.93000000,2377.06000000,2377.59000000,142.84550000,1728036119999,339586.08621900,1536,88.04110000,209287.80077000,0],
[1728036120000,2377.59000000,2379.74000000,2377.59000000,2379.74000000,86.80170000,1728036179999,206494.83564000,2386,49.68020000,118182.92593700,0],
[1728036180000,2379.74000000,2380.30000000,2379.71000000,2380.30000000,50.32760000,1728036239999,119772.38727700,238,31.41680000,74768.48747300,0],
[1728036240000,2380.30000000,2380.30000000,2378.57000000,2378.57000000,89.38880000,1728036299999,212704.97185200,1746,22.79710000,54240.34306400,0],
[1728036300000,2378.57000000,2379.80000000,2378.00000000,2378.77000000,45.78730000,1728036359999,108929.91988600,2034,30.17360000,71788.39846400,0],
[1728036360000,2378.77000000,2379.55000000,2378.77000000,2378.86000000,47.20270000,1728036419999,112305.81339000,1387,18.91700000,45006.24993500,0],
[1728036420000,2378.85000000,2379.10000000,2377.01000000,2377.01000000,43.82880000,1728036479999,104232.46683200,831,13.99570000,33283.67793900,0],
[1728036480000,2377.02000000,2377.02000000,2375.51000000,2375.89000000,68.83880000,1728036539999,163576.15262900,2488,11.65970000,27704.72796100,0],
[1728036540000,2375.88000000,2376.36000000,2375.68000000,2375.70000000,70.08610000,1728036599999,166533.36831500,1093,34.48200000,81931.75263300,0],
[1728036600000,2375.69000000,2376.96000000,2375.69000000,2376.38000000,82.26700000,1728036659999,195481.05135000,1222,34.28990000,81483.73283700,0],
[1728036660000,2376.37000000,2376.52000000,2375.97000000,2376.37000000,23.72690000,1728036719999,56381.18319400,554,10.39410000,24697.94697600,0],
[1728036720000,2376.38000000,2376.38000000,2375.28000000,2375.50000000,70.84470000,1728036779999,168313.63115800,1028,4.90770000,11659.92388500,0],
[1728036780000,2375.50000000,2376.42000000,2375.49000000,2376.41000000,40.72460000,1728036839999,96766.34899600,684,21.46060000,50994.82140600,0],
[1728036840000,2376.42000000,2376.80000000,2376.05000000,2376.29000000,54.34660000,1728036899999,129150.11212300,772,16.43860000,39061.64910400,0],
[1728036900000,2376.29000000,2377.14000000,2376.29000000,2377.00000000,93.38240000,1728036959999,221962.91842000,875,83.24830000,197874.49532700,0],
[1728036960000,2376.99000000,2376.99000000,2376.00000000,2376.11000000,64.27180000,1728037019999,152732.23263100,1016,33.72620000,80147.72261900,0],
[1728037020000,2376.10000000,2376.20000000,2374.74000000,2375.19000000,77.72800000,1728037079999,184627.84175600,1732,12.54580000,29796.04635300,0],
[1728037080000,2375.20000000,2376.60000000,2375.20000000,2375.86000000,76.70840000,1728037139999,182263.57414600,2118,41.31090000,98148.11441400,0],
[1728037140000,2375.86000000,2375.97000000,2375.41000000,2375.41000000,33.92910000,1728037199999,80606.94731500,419,10.99570000,26123.81147400,0],
[1728037200000,2375.42000000,2377.13000000,2375.41000000,2377.13000000,36.78360000,1728037259999,87400.02208900,1137,19.22010000,45666.03332600,0],
[1728037260000,2377.18000000,2379.00000000,2377.17000000,2378.41000000,34.90590000,1728037319999,83010.40277500,852,20.21320000,48062.32669400,0],
[1728037320000,2378.40000000,2379.14000000,2377.68000000,2377.69000000,64.51110000,1728037379999,153441.21840800,1644,16.53560000,39323.52449700,0],
[1728037380000,2377.69000000,2377.69000000,2376.80000000,2377.38000000,56.95070000,1728037439999,135379.85483400,1139,36.43890000,86616.11288800,0],
[1728037440000,2377.37000000,2377.37000000,2376.43000000,2376.43000000,24.03720000,1728037499999,57137.91112500,982,4.01520000,9543.97971400,0],
[1728037500000,2376.43000000,2377.60000000,2376.43000000,2377.60000000,38.22570000,1728037559999,90871.91559600,1026,36.31680000,86333.40751400,0],
[1728037560000,2377.60000000,2377.79000000,2375.37000000,2375.57000000,70.94100000,1728037619999,168616.25988500,2054,32.54870000,77365.87431700,0],
[1728037620000,2375.58000000,2376.60000000,2375.57000000,2376.18000000,32.39320000,1728037679999,76973.91443900,739,7.68930000,18270.30455000,0],
[1728037680000,2376.17000000,2376.18000000,2375.41000000,2375.64000000,22.68830000,1728037739999,53905.68414200,402,10.43610000,24794.43751500,0],
[1728037740000,2375.64000000,2375.67000000,2375.04000000,2375.59000000,14.72310000,1728037799999,34972.74730400,1211,7.52200000,17867.46409700,0],
[1728037800000,2375.60000000,2375.60000000,2374.11000000,2374.80000000,380.08970000,1728037859999,902757.72496600,1231,22.26380000,52868.30982600,0],
[1728037860000,2374.80000000,2376.60000000,2374.79000000,2376.59000000,27.91080000,1728037919999,66312.78025000,509,20.19560000,47979.13107600,0],
[1728037920000,2376.59000000,2376.60000000,2375.93000000,2376.60000000,48.53640000,1728037979999,115330.62636300,823,25.74640000,61174.40994600,0],
[1728037980000,2376.59000000,2376.60000000,2376.31000000,2376.45000000,27.34930000,1728038039999,64993.35691400,456,15.45380000,36724.20820100,0],
[1728038040000,2376.45000000,2377.60000000,2376.44000000,2377.60000000,35.55260000,1728038099999,84508.94501000,926,31.05150000,73810.33475700,0],
[1728038100000,2377.60000000,2377.60000000,2376.98000000,2377.59000000,35.02850000,1728038159999,83272.72125800,1229,22.30640000,53027.48943200,0],
[1728038160000,2377.60000000,2378.99000000,2377.60000000,2378.43000000,62.92970000,1728038219999,149662.58541900,1086,54.35330000,129260.86461300,0],
[1728038220000,2378.43000000,2378.99000000,2378.09000000,2378.99000000,37.11660000,1728038279999,88283.57393600,988,27.27940000,64885.04711400,0],
[1728038280000,2379.00000000,2379.79000000,2378.99000000,2379.79000000,56.09110000,1728038339999,133448.54535400,356,50.31020000,119693.05654000,0],
[1728038340000,2379.79000000,2379.98000000,2379.28000000,2379.57000000,62.31530000,1728038399999,148288.85154300,669,40.80370000,97097.67553400,0],
[1728038400000,2379.56000000,2379.56000000,2377.83000000,2377.84000000,66.35750000,1728038459999,157833.76651500,1767,13.22440000,31452.57811700,0],
[1728038460000,2377.85000000,2378.80000000,2377.85000000,2378.59000000,19.68920000,1728038519999,46830.71037900,359,14.40240000,34256.11939500,0],
[1728038520000,2378.59000000,2378.97000000,2378.33000000,2378.97000000,34.83250000,1728038579999,82853.84627800,359,19.87030000,47265.32005200,0],
[1728038580000,2378.97000000,2379.19000000,2378.65000000,2378.65000000,16.41790000,1728038639999,39059.32870100,416,8.41020000,20008.65032400,0],
[1728038640000,2378.65000000,2379.06000000,2378.49000000,2379.06000000,33.35980000,1728038699999,79354.75410800,446,19.15070000,45557.20466700,0],
[1728038700000,2379.06000000,2379.79000000,2378.50000000,2379.63000000,38.82220000,1728038759999,92362.31817800,872,26.83880000,63852.01503000,0],
[1728038760000,2379.63000000,2379.63000000,2377.36000000,2377.36000000,39.70860000,1728038819999,94450.62425300,1986,16.89420000,40188.37643900,0],
[1728038820000,2377.30000000,2377.99000000,2377.11000000,2377.97000000,18.73520000,1728038879999,44540.57920900,934,11.61070000,27602.91627200,0],
[1728038880000,2377.97000000,2378.42000000,2377.11000000,2377.22000000,120.76840000,1728038939999,287163.07738900,1844,97.02590000,230702.65411800,0],
[1728038940000,2377.22000000,2377.47000000,2377.22000000,2377.47000000,19.85640000,1728038999999,47206.83414900,252,10.63900000,25293.03336900,0],
[1728039000000,2377.46000000,2377.78000000,2377.02000000,2377.57000000,23.62320000,1728039059999,56165.63636900,831,8.75500000,20814.88538700,0],
[1728039060000,2377.57000000,2377.86000000,2377.02000000,2377.85000000,32.81000000,1728039119999,78002.50228800,1272,20.28720000,48230.37325600,0],
[1728039120000,2377.86000000,2378.00000000,2377.41000000,2377.42000000,33.86320000,1728039179999,80512.30707100,728,16.11090000,38305.71942700,0],
[1728039180000,2377.42000000,2377.58000000,2376.00000000,2376.00000000,73.01680000,1728039239999,173561.09144300,772,17.04920000,40528.87045600,0],
[1728039240000,2376.00000000,2376.60000000,2375.86000000,2376.04000000,157.54640000,1728039299999,374344.93190300,547,24.40630000,57993.98222600,0],
[1728039300000,2376.04000000,2376.04000000,2374.20000000,2374.50000000,96.69390000,1728039359999,229672.49822300,1518,26.25880000,62373.84470100,0],
[1728039360000,2374.50000000,2375.00000000,2374.20000000,2375.00000000,132.05300000,1728039419999,313562.72694900,524,27.59200000,65520.66819700,0],
[1728039420000,2374.99000000,2376.00000000,2374.99000000,2375.76000000,31.85670000,1728039479999,75681.35651600,649,19.55810000,46460.59106800,0],
[1728039480000,2375.75000000,2375.76000000,2374.99000000,2375.18000000,17.39050000,1728039539999,41307.90652900,680,7.36090000,17483.21937500,0],
[1728039540000,2375.17000000,2375.18000000,2375.16000000,2375.17000000,13.34960000,1728039599999,31707.48425100,136,3.69780000,8782.90507300,0],
[1728039600000,2375.17000000,2375.80000000,2375.17000000,2375.80000000,31.25390000,1728039659999,74238.27403200,704,14.30450000,33977.96640800,0],
[1728039660000,2375.80000000,2376.42000000,2374.21000000,2374.63000000,125.05510000,1728039719999,297089.54776300,2171,81.64980000,193996.46317600,0],
[1728039720000,2374.64000000,2375.91000000,2374.50000000,2375.00000000,60.65340000,1728039779999,144066.25430300,2120,27.21810000,64641.01779600,0],
[1728039780000,2375.00000000,2376.89000000,2375.00000000,2376.89000000,28.22870000,1728039839999,67067.29809200,818,17.73190000,42126.80992800,0],
[1728039840000,2376.89000000,2377.26000000,2376.88000000,2376.94000000,23.95260000,1728039899999,56938.97844800,552,9.54380000,22686.24274800,0],
[1728039900000,2376.93000000,2377.25000000,2376.14000000,2376.54000000,63.13140000,1728039959999,150034.99888600,1950,38.58110000,91677.49899500,0],
[1728039960000,2376.54000000,2377.22000000,2375.62000000,2375.88000000,110.50940000,1728040019999,262569.45372200,1137,10.75590000,25563.88807400,0],
[1728040020000,2375.88000000,2376.14000000,2375.42000000,2376.00000000,34.13280000,1728040079999,81094.55878600,1256,16.96400000,40303.67872400,0],
[1728040080000,2376.00000000,2377.37000000,2376.00000000,2377.23000000,43.00770000,1728040139999,102225.89147800,1443,36.04080000,85665.05394200,0],
[1728040140000,2377.23000000,2378.44000000,2377.23000000,2378.44000000,41.79940000,1728040199999,99400.25460300,967,36.26610000,86241.97187300,0],
[1728040200000,2378.43000000,2379.17000000,2378.22000000,2379.17000000,68.26580000,1728040259999,162376.93231500,560,57.89510000,137709.44364500,0],
[1728040260000,2379.17000000,2379.17000000,2378.47000000,2379.09000000,30.37090000,1728040319999,72250.05407000,637,8.46770000,20143.92158100,0],
[1728040320000,2379.08000000,2379.49000000,2378.93000000,2379.19000000,36.59920000,1728040379999,87071.43946600,1161,24.68400000,58724.10024200,0],
[1728040380000,2379.20000000,2379.31000000,2378.97000000,2379.31000000,14.44700000,1728040439999,34370.55515900,535,7.03440000,16735.30841200,0],
[1728040440000,2379.31000000,2379.62000000,2379.02000000,2379.24000000,73.63640000,1728040499999,175199.41004500,1156,34.19140000,81347.02366100,0],
[1728040500000,2379.25000000,2380.38000000,2379.24000000,2380.37000000,94.03080000,1728040559999,223812.77980500,871,24.60580000,58559.10190000,0],
[1728040560000,2380.37000000,2380.52000000,2379.47000000,2379.48000000,56.39680000,1728040619999,134235.34793500,970,21.06110000,50127.69722100,0],
[1728040620000,2379.48000000,2381.80000000,2379.48000000,2381.80000000,51.97780000,1728040679999,123751.82892200,1259,41.01340000,97644.86522100,0],
[1728040680000,2381.79000000,2382.84000000,2381.26000000,2381.27000000,344.11670000,1728040739999,819818.17388700,1983,274.29330000,653496.45109900,0],
[1728040740000,2381.27000000,2381.61000000,2381.26000000,2381.61000000,37.97370000,1728040799999,90429.82023300,471,22.98710000,54740.96697600,0],
[1728040800000,2381.61000000,2382.46000000,2381.60000000,2382.46000000,29.26620000,1728040859999,69712.75913400,1387,22.06140000,52550.10926300,0],
[1728040860000,2382.45000000,2382.46000000,2379.93000000,2379.93000000,91.11270000,1728040919999,217003.04397700,1625,11.99290000,28566.74446900,0],
[1728040920000,2379.93000000,2379.93000000,2378.21000000,2378.22000000,88.56370000,1728040979999,210680.08396300,963,9.44750000,22475.47798700,0],
[1728040980000,2378.22000000,2379.12000000,2378.22000000,2378.66000000,26.96970000,1728041039999,64153.92641700,779,12.26740000,29180.00674300,0],
[1728041040000,2378.66000000,2379.00000000,2378.65000000,2379.00000000,12.81150000,1728041099999,30475.50200700,151,7.95420000,18920.77555100,0],
[1728041100000,2378.99000000,2380.07000000,2378.99000000,2380.00000000,13.23490000,1728041159999,31491.82545000,589,10.79410000,25684.02773500,0],
[1728041160000,2380.00000000,2380.37000000,2379.72000000,2379.72000000,88.26340000,1728041219999,210053.83519700,738,36.05010000,85792.76402100,0],
[1728041220000,2379.72000000,2379.95000000,2379.18000000,2379.30000000,104.97830000,1728041279999,249817.79072400,1033,66.39700000,158006.91223900,0],
[1728041280000,2379.29000000,2379.95000000,2379.29000000,2379.95000000,27.91860000,1728041339999,66439.75369400,485,19.23640000,45777.60115000,0],
[1728041340000,2379.94000000,2379.95000000,2378.50000000,2378.90000000,41.12180000,1728041399999,97833.91083800,1038,20.30820000,48311.85943900,0],
[1728041400000,2378.91000000,2380.45000000,2378.88000000,2380.45000000,173.90840000,1728041459999,413828.83750800,948,51.85100000,123370.58320200,0],
[1728041460000,2380.44000000,2380.44000000,2379.23000000,2379.24000000,38.68400000,1728041519999,92059.20665200,943,6.41950000,15274.93012800,0],
[1728041520000,2379.24000000,2379.81000000,2379.24000000,2379.70000000,62.05610000,1728041579999,147668.37239400,277,59.14400000,140738.32993300,0],
[1728041580000,2379.70000000,2379.70000000,2378.35000000,2378.35000000,32.68140000,1728041639999,77754.46450800,638,5.18020000,12322.76020400,0],
[1728041640000,2378.36000000,2379.00000000,2378.23000000,2378.66000000,67.11110000,1728041699999,159616.18342200,768,41.81360000,99445.27031400,0],
[1728041700000,2378.66000000,2378.77000000,2378.00000000,2378.01000000,96.18540000,1728041759999,228764.33207600,794,42.24740000,100477.12575200,0],
[1728041760000,2378.01000000,2380.55000000,2378.00000000,2380.55000000,298.62660000,1728041819999,710396.90313500,1650,291.77690000,694104.38961100,0],
[1728041820000,2380.56000000,2381.49000000,2379.76000000,2381.23000000,48.35650000,1728041879999,115124.03934300,2085,33.88500000,80676.07281400,0],
[1728041880000,2381.23000000,2382.00000000,2381.23000000,2381.38000000,63.50000000,1728041939999,151226.62901300,835,28.31700000,67437.20375300,0],
[1728041940000,2381.39000000,2381.39000000,2380.00000000,2380.02000000,48.03890000,1728041999999,114368.63409300,706,12.28860000,29251.75692400,0],
[1728042000000,2380.01000000,2380.59000000,2379.44000000,2380.59000000,40.08710000,1728042059999,95407.36864000,1504,11.39060000,27108.46723600,0],
[1728042060000,2380.58000000,2380.78000000,2380.16000000,2380.78000000,43.20600000,1728042119999,102855.56626200,875,7.59570000,18081.70708600,0],
[1728042120000,2380.78000000,2381.10000000,2380.60000000,2380.86000000,37.04690000,1728042179999,88206.38851400,739,17.13190000,40788.29746200,0],
[1728042180000,2380.87000000,2381.46000000,2380.86000000,2381.17000000,35.89700000,1728042239999,85478.31983800,1213,27.45810000,65382.57993100,0],
[1728042240000,2381.17000000,2381.17000000,2380.60000000,2380.61000000,37.87810000,1728042299999,90186.42728600,438,4.24050000,10095.68472000,0],
[1728042300000,2380.61000000,2382.20000000,2380.60000000,2382.01000000,80.45600000,1728042359999,191609.09316700,1375,53.00420000,126222.83859200,0],
[1728042360000,2382.01000000,2384.20000000,2382.00000000,2383.68000000,89.48040000,1728042419999,213252.14124000,808,61.56830000,146721.92555400,0],
[1728042420000,2383.69000000,2384.16000000,2383.65000000,2383.77000000,29.94560000,1728042479999,71387.13312400,727,21.26750000,50699.25062700,0],
[1728042480000,2383.78000000,2383.78000000,2383.55000000,2383.78000000,32.78130000,1728042539999,78141.53638700,387,17.87650000,42613.23300800,0],
[1728042540000,2383.78000000,2384.44000000,2383.78000000,2384.44000000,80.78010000,1728042599999,192605.74319600,781,28.34410000,67579.48992200,0],
[1728042600000,2384.43000000,2384.74000000,2384.00000000,2384.00000000,61.54230000,1728042659999,146730.91050100,887,24.22820000,57766.24212800,0],
[1728042660000,2384.01000000,2386.07000000,2384.00000000,2385.51000000,52.30390000,1728042719999,124765.81977100,2378,25.58290000,61018.39540900,0],
[1728042720000,2385.51000000,2386.08000000,2385.50000000,2385.72000000,64.92740000,1728042779999,154898.83780300,1052,48.33430000,115308.19899300,0],
[1728042780000,2385.71000000,2385.72000000,2385.60000000,2385.61000000,61.18640000,1728042839999,145967.59892400,247,20.53310000,48984.05013500,0],
[1728042840000,2385.60000000,2386.49000000,2385.60000000,2385.90000000,59.46950000,1728042899999,141894.13879500,829,41.77010000,99660.78509200,0],
[1728042900000,2385.91000000,2385.98000000,2383.53000000,2383.53000000,106.75540000,1728042959999,254639.49128300,942,12.27230000,29271.96590500,0],
[1728042960000,2383.53000000,2384.90000000,2383.53000000,2384.33000000,52.93700000,1728043019999,126222.03185600,1423,20.09610000,47915.88069000,0],
[1728043020000,2384.39000000,2385.82000000,2384.39000000,2385.66000000,43.28420000,1728043079999,103233.71995100,758,29.82410000,71127.08263300,0],
[1728043080000,2385.66000000,2386.49000000,2385.66000000,2386.28000000,98.33190000,1728043139999,234619.65663500,1137,81.88020000,195358.85265100,0],
[1728043140000,2386.28000000,2386.28000000,2386.10000000,2386.20000000,31.73430000,1728043199999,75723.25475100,283,11.88980000,28370.47583200,0],
[1728043200000,2386.20000000,2386.86000000,2385.86000000,2386.00000000,87.58150000,1728043259999,209018.29664300,2137,55.37100000,132147.43134400,0],
[1728043260000,2386.00000000,2386.42000000,2385.26000000,2386.42000000,62.17990000,1728043319999,148348.34384000,1185,35.56500000,84850.89218800,0],
[1728043320000,2386.43000000,2387.00000000,2385.33000000,2385.47000000,89.24360000,1728043379999,212967.22214100,1453,26.97540000,64361.83082400,0],
[1728043380000,2385.40000000,2385.40000000,2383.44000000,2383.44000000,59.49750000,1728043439999,141855.67430500,881,19.99310000,47662.89922400,0],
[1728043440000,2383.44000000,2384.36000000,2382.64000000,2383.69000000,303.75550000,1728043499999,724104.22866800,1621,23.97710000,57147.17923700,0],
[1728043500000,2383.70000000,2384.40000000,2383.00000000,2383.00000000,108.63010000,1728043559999,258900.81591200,2194,64.47280000,153648.44750200,0],
[1728043560000,2383.01000000,2383.08000000,2382.01000000,2382.58000000,34.98070000,1728043619999,83349.53976000,1710,15.82360000,37702.43658500,0],
[1728043620000,2382.58000000,2382.60000000,2382.00000000,2382.60000000,93.74030000,1728043679999,223317.79527200,1233,37.92550000,90344.60379000,0],
[1728043680000,2382.60000000,2383.20000000,2382.08000000,2382.31000000,28.11750000,1728043739999,66989.23258600,1368,8.96790000,21366.24972500,0],
[1728043740000,2382.31000000,2382.31000000,2381.10000000,2381.40000000,78.67640000,1728043799999,187360.61906900,756,21.25730000,50620.89750200,0],
[1728043800000,2381.40000000,2382.13000000,2381.40000000,2381.46000000,43.09200000,1728043859999,102640.15516700,998,15.51850000,36962.02888400,0],
[1728043860000,2381.45000000,2384.47000000,2381.45000000,2384.13000000,65.71970000,1728043919999,156601.90086700,1746,53.30710000,127026.90589900,0],
[1728043920000,2384.13000000,2384.47000000,2382.82000000,2382.82000000,42.24200000,1728043979999,100703.14814300,943,10.34630000,24665.82456200,0],
[1728043980000,2382.82000000,2382.82000000,2382.05000000,2382.66000000,28.51240000,1728044039999,67930.49182800,1129,18.13000000,43194.18746500,0],
[1728044040000,2382.66000000,2383.13000000,2381.50000000,2381.77000000,386.28770000,1728044099999,920276.12758900,992,318.92550000,759825.38512000,0],
[1728044100000,2381.77000000,2382.85000000,2381.76000000,2382.85000000,137.34330000,1728044159999,327159.40542300,1976,22.24460000,52991.48608400,0],
[1728044160000,2382.85000000,2383.80000000,2382.83000000,2383.28000000,54.67000000,1728044219999,130292.20903300,1445,41.03750000,97800.60379600,0],
[1728044220000,2383.28000000,2384.17000000,2383.28000000,2383.95000000,70.57140000,1728044279999,168229.51978000,768,48.79160000,116309.57505900,0],
[1728044280000,2383.96000000,2384.81000000,2383.63000000,2384.81000000,38.76570000,1728044339999,92416.96405200,1462,23.42260000,55839.75715600,0],
[1728044340000,2384.80000000,2385.36000000,2384.25000000,2385.36000000,52.49640000,1728044399999,125190.85337500,1790,26.99680000,64380.24297800,0],
[1728044400000,2385.36000000,2385.90000000,2385.00000000,2385.89000000,50.40370000,1728044459999,120223.37814000,1184,47.68920000,113747.96197700,0],
[1728044460000,2385.89000000,2385.90000000,2383.81000000,2383.84000000,139.41510000,1728044519999,332557.35166700,1897,36.07030000,86029.47828300,0],
[1728044520000,2383.84000000,2384.39000000,2383.04000000,2383.45000000,54.46270000,1728044579999,129825.94804300,1442,16.86850000,40211.80049800,0],
[1728044580000,2383.47000000,2384.80000000,2382.74000000,2384.27000000,44.21580000,1728044639999,105404.17861100,1830,20.15110000,48034.06512800,0],
[1728044640000,2384.27000000,2387.12000000,2384.27000000,2386.26000000,66.01380000,1728044699999,157516.84081700,2812,51.04620000,121795.39551900,0],
[1728044700000,2386.26000000,2386.73000000,2385.82000000,2386.60000000,53.58490000,1728044759999,127870.87107300,944,22.25940000,53115.73016400,0],
[1728044760000,2386.58000000,2387.17000000,2386.41000000,2387.00000000,96.48750000,1728044819999,230291.10551600,1447,37.81520000,90248.01187800,0],
[1728044820000,2386.99000000,2386.99000000,2384.47000000,2385.31000000,235.78560000,1728044879999,562576.18705200,1956,126.14950000,300991.07972100,0],
[1728044880000,2385.32000000,2386.03000000,2385.32000000,2385.91000000,20.42490000,1728044939999,48730.52683000,1051,9.65830000,23042.14409800,0],
[1728044940000,2385.91000000,2388.50000000,2385.47000000,2388.50000000,162.94660000,1728044999999,388958.56152800,3400,120.38880000,287365.64255200,0],
[1728045000000,2388.49000000,2399.05000000,2383.25000000,2392.81000000,4388.40410000,1728045059999,10502154.33410100,19652,2629.81850000,6293258.44520500,0],
[1728045060000,2392.81000000,2394.29000000,2387.79000000,2392.57000000,719.28330000,1728045119999,1720370.72311100,12785,300.98320000,719855.01155500,0],
[1728045120000,2392.56000000,2392.56000000,2384.30000000,2384.81000000,545.11530000,1728045179999,1302527.42831500,9903,137.72170000,329050.77949100,0],
[1728045180000,2384.80000000,2385.90000000,2382.98000000,2383.80000000,360.10230000,1728045239999,858677.55716200,6674,128.94380000,307460.16470000,0],
[1728045240000,2383.80000000,2383.80000000,2376.05000000,2380.95000000,932.39050000,1728045299999,2217572.21145900,6818,325.62770000,774353.36214300,0],
[1728045300000,2380.95000000,2387.00000000,2380.74000000,2382.05000000,364.76980000,1728045359999,869456.55955700,6086,191.92100000,457426.05568800,0],
[1728045360000,2382.04000000,2383.47000000,2380.51000000,2383.38000000,166.14130000,1728045419999,395683.30811300,4166,76.01530000,181040.36459100,0],
[1728045420000,2383.37000000,2384.83000000,2382.72000000,2383.61000000,218.40820000,1728045479999,520688.68115000,4768,79.92060000,190508.23962000,0],
[1728045480000,2383.61000000,2385.40000000,2382.31000000,2385.00000000,320.28610000,1728045539999,763736.45252600,4750,157.56510000,375708.95218800,0],
[1728045540000,2385.00000000,2385.99000000,2383.76000000,2385.79000000,130.73710000,1728045599999,311854.17354400,2576,74.27040000,177157.36122400,0],
[1728045600000,2385.79000000,2386.49000000,2381.09000000,2381.31000000,231.09090000,1728045659999,551069.16206700,5236,72.03150000,171772.21166100,0],
[1728045660000,2381.32000000,2381.36000000,2376.72000000,2379.00000000,275.36790000,1728045719999,655028.01683300,3769,99.24500000,236088.00652400,0],
[1728045720000,2379.00000000,2379.97000000,2377.10000000,2379.12000000,198.03740000,1728045779999,471051.85776700,3218,84.93160000,202024.12570900,0],
[1728045780000,2379.12000000,2379.40000000,2375.99000000,2376.97000000,1015.59590000,1728045839999,2413827.17854500,4257,377.57970000,897236.12121600,0],
[1728045840000,2377.00000000,2377.20000000,2374.65000000,2375.60000000,350.12920000,1728045899999,831917.28993100,2145,87.74100000,208418.00231600,0],
[1728045900000,2375.60000000,2377.00000000,2375.60000000,2376.90000000,126.37550000,1728045959999,300330.16075600,1953,52.08650000,123769.97088100,0],
[1728045960000,2376.90000000,2384.91000000,2376.90000000,2383.59000000,1136.59050000,1728046019999,2707320.77795600,4836,883.49730000,2104146.75405300,0],
[1728046020000,2383.59000000,2385.03000000,2382.15000000,2384.83000000,113.47480000,1728046079999,270468.51217800,3284,57.26020000,136487.23127200,0],
[1728046080000,2384.84000000,2385.80000000,2383.44000000,2384.99000000,180.85930000,1728046139999,431322.12335500,3369,100.24390000,239075.63320900,0],
[1728046140000,2384.99000000,2386.33000000,2382.85000000,2382.85000000,666.59490000,1728046199999,1589653.79340800,3270,139.74380000,333194.65063000,0],
[1728046200000,2382.86000000,2383.90000000,2380.40000000,2382.60000000,129.63990000,1728046259999,308837.52437600,2838,90.99800000,216780.15812200,0],
[1728046260000,2382.59000000,2385.00000000,2382.20000000,2384.60000000,97.64680000,1728046319999,232745.08855700,1550,50.79090000,121044.09209900,0],
[1728046320000,2384.60000000,2387.48000000,2383.79000000,2386.92000000,138.43670000,1728046379999,330278.11548000,3686,68.07240000,162393.15825400,0],
[1728046380000,2386.91000000,2388.08000000,2384.90000000,2388.05000000,178.24920000,1728046439999,425488.89605600,3000,69.73890000,166487.03322300,0],
[1728046440000,2388.07000000,2390.95000000,2387.52000000,2390.18000000,284.33680000,1728046499999,679266.85163200,3879,192.04550000,458724.53811300,0],
[1728046500000,2390.18000000,2391.48000000,2389.50000000,2391.00000000,289.50880000,1728046559999,692120.19939100,2949,167.69220000,400887.77915400,0],
[1728046560000,2391.00000000,2393.81000000,2390.80000000,2391.83000000,444.52460000,1728046619999,1063338.86514800,4579,202.34020000,483952.06984400,0],
[1728046620000,2391.84000000,2393.20000000,2390.81000000,2391.67000000,378.99180000,1728046679999,906505.72709400,4665,150.16050000,359156.49364700,0],
[1728046680000,2391.68000000,2393.30000000,2391.02000000,2392.20000000,338.19080000,1728046739999,808987.45050900,6053,183.89950000,439861.13667200,0],
[1728046740000,2392.20000000,2397.48000000,2392.20000000,2397.35000000,431.54660000,1728046799999,1033974.73618500,5392,185.68060000,444834.06290900,0],
[1728046800000,2397.35000000,2399.99000000,2390.50000000,2391.83000000,1924.62670000,1728046859999,4609043.73014500,10024,577.14730000,1382388.73793200,0],
[1728046860000,2391.83000000,2393.51000000,2389.66000000,2390.60000000,584.87450000,1728046919999,1398770.89801200,7251,304.26990000,727697.80711600,0],
[1728046920000,2390.61000000,2395.00000000,2390.61000000,2394.90000000,221.86480000,1728046979999,530852.85181100,5164,98.21310000,234985.06699200,0],
[1728046980000,2394.89000000,2394.89000000,2391.40000000,2391.74000000,288.25460000,1728047039999,689720.52850600,3932,53.71930000,128529.12395400,0],
[1728047040000,2391.74000000,2392.50000000,2388.02000000,2388.88000000,389.83030000,1728047099999,931916.63301600,4189,32.99760000,78880.58505000,0],
[1728047100000,2388.89000000,2390.55000000,2387.89000000,2390.00000000,184.54810000,1728047159999,440955.33929600,3745,85.98280000,205440.17156100,0],
[1728047160000,2390.00000000,2390.89000000,2387.81000000,2388.01000000,227.31570000,1728047219999,543185.05127800,5053,45.99350000,109885.48694800,0],
[1728047220000,2388.06000000,2389.20000000,2385.87000000,2388.92000000,166.39170000,1728047279999,397330.20344500,3222,64.49610000,153999.13265100,0],
[1728047280000,2388.93000000,2390.87000000,2388.69000000,2390.31000000,193.75510000,1728047339999,462973.62779700,3197,50.09560000,119702.04229400,0],
[1728047340000,2390.31000000,2390.79000000,2389.00000000,2389.49000000,148.92940000,1728047399999,355912.09188400,2787,76.10690000,181885.26816900,0],
[1728047400000,2389.48000000,2390.90000000,2389.34000000,2390.27000000,168.11140000,1728047459999,401841.66108300,2088,58.69660000,140300.97127200,0],
[1728047460000,2390.27000000,2390.40000000,2389.21000000,2390.40000000,106.93580000,1728047519999,255545.11135000,1226,36.85910000,88076.32206800,0],
[1728047520000,2390.39000000,2392.59000000,2390.00000000,2391.69000000,179.55930000,1728047579999,429402.67963900,2303,59.32750000,141880.93000100,0],
[1728047580000,2391.63000000,2395.00000000,2391.63000000,2393.80000000,1011.83270000,1728047639999,2422349.53585800,1949,762.34340000,1825025.19345400,0],
[1728047640000,2393.80000000,2393.81000000,2391.59000000,2391.60000000,221.62830000,1728047699999,530283.04730200,1670,99.71010000,238571.32740700,0],
[1728047700000,2391.59000000,2393.70000000,2391.59000000,2392.90000000,163.52050000,1728047759999,391237.42368000,3022,75.42500000,180453.68615400,0],
[1728047760000,2392.90000000,2393.65000000,2392.40000000,2392.68000000,227.08370000,1728047819999,543434.19994500,2123,96.19820000,230215.88910100,0],
[1728047820000,2392.68000000,2392.83000000,2388.50000000,2388.68000000,454.71440000,1728047879999,1087424.52682000,4753,146.14520000,349479.08999100,0],
[1728047880000,2388.67000000,2388.67000000,2385.70000000,2385.70000000,242.87910000,1728047939999,579850.04750300,2903,69.48300000,165890.57144500,0],
[1728047940000,2385.71000000,2386.79000000,2385.01000000,2386.79000000,217.51790000,1728047999999,518926.77056500,3629,146.36210000,349172.18603700,0],
[1728048000000,2386.79000000,2387.16000000,2385.00000000,2385.98000000,208.95910000,1728048059999,498612.03645000,4024,92.29110000,220220.60871200,0],
[1728048060000,2385.98000000,2386.23000000,2384.11000000,2386.05000000,153.64130000,1728048119999,366379.49966000,3216,93.56660000,223112.55755200,0],
[1728048120000,2386.06000000,2386.22000000,2384.11000000,2384.47000000,132.04750000,1728048179999,314942.52046300,3026,43.77950000,104419.05471000,0],
[1728048180000,2384.46000000,2386.67000000,2384.46000000,2385.22000000,233.26110000,1728048239999,556391.79425200,2061,180.58740000,430721.35305000,0],
[1728048240000,2385.21000000,2385.21000000,2382.56000000,2382.57000000,219.37700000,1728048299999,522975.22778200,3703,71.57650000,170620.50021000,0],
[1728048300000,2382.57000000,2384.47000000,2382.12000000,2384.13000000,311.86270000,1728048359999,743129.38265500,4462,111.51920000,265728.21251800,0],
[1728048360000,2384.14000000,2384.14000000,2381.94000000,2383.47000000,153.30920000,1728048419999,365315.18361100,3034,66.92710000,159492.61143900,0],
[1728048420000,2383.47000000,2384.47000000,2382.94000000,2384.37000000,84.62820000,1728048479999,201733.55773700,2548,35.38270000,84342.75532000,0],
[1728048480000,2384.37000000,2384.37000000,2382.49000000,2383.55000000,74.57130000,1728048539999,177725.60050700,2137,35.80790000,85334.87864200,0],
[1728048540000,2383.56000000,2385.23000000,2382.31000000,2382.31000000,141.53870000,1728048599999,337436.60265700,4081,61.53490000,146717.84547100,0],
[1728048600000,2382.32000000,2383.73000000,2380.51000000,2381.00000000,381.71680000,1728048659999,909423.42807700,6976,244.64590000,582912.37591300,0],
[1728048660000,2381.00000000,2383.21000000,2378.76000000,2383.21000000,387.05880000,1728048719999,921363.35160800,3350,222.00000000,528563.53507500,0],
[1728048720000,2383.23000000,2383.23000000,2380.00000000,2381.46000000,204.26660000,1728048779999,486431.01580600,4448,63.96380000,152292.60391900,0],
[1728048780000,2381.46000000,2382.72000000,2379.56000000,2382.53000000,267.27360000,1728048839999,636386.53690800,2810,120.14150000,286124.81035000,0],
[1728048840000,2382.54000000,2383.78000000,2382.51000000,2383.38000000,234.70190000,1728048899999,559309.75361200,3636,153.41170000,365569.38316100,0],
[1728048900000,2383.38000000,2386.30000000,2382.96000000,2386.30000000,128.93840000,1728048959999,307394.46063200,3561,101.74240000,242570.08475200,0],
[1728048960000,2386.30000000,2388.60000000,2385.26000000,2387.42000000,255.52880000,1728049019999,609950.42972500,4283,118.55250000,282993.85862500,0],
[1728049020000,2387.41000000,2387.41000000,2382.57000000,2384.01000000,164.90160000,1728049079999,393270.17837500,4565,55.36840000,132030.50995400,0],
[1728049080000,2384.01000000,2385.80000000,2383.52000000,2384.67000000,150.39410000,1728049139999,358623.81073900,1973,65.68120000,156620.27915200,0],
[1728049140000,2384.67000000,2387.49000000,2384.66000000,2387.01000000,234.50600000,1728049199999,559598.03350800,1865,141.23980000,337001.84482900,0],
[1728049200000,2387.02000000,2390.00000000,2387.02000000,2388.07000000,152.20420000,1728049259999,363565.35164400,2352,79.45460000,189777.10225400,0],
[1728049260000,2388.06000000,2390.51000000,2387.34000000,2390.39000000,179.53700000,1728049319999,428879.50698900,1946,106.87660000,255332.01831500,0],
[1728049320000,2390.40000000,2391.70000000,2390.26000000,2390.51000000,209.16370000,1728049379999,500124.04978800,1201,119.71310000,286238.43760200,0],
[1728049380000,2390.51000000,2391.33000000,2389.20000000,2390.03000000,118.59240000,1728049439999,283494.04354000,1043,61.05940000,145972.35048400,0],
[1728049440000,2390.03000000,2390.57000000,2385.40000000,2387.20000000,448.62360000,1728049499999,1071524.02380200,2049,51.09770000,122034.48391200,0],
[1728049500000,2387.20000000,2388.50000000,2385.25000000,2387.03000000,73.10690000,1728049559999,174489.20625900,4421,50.53850000,120620.95056300,0],
[1728049560000,2387.03000000,2387.03000000,2385.00000000,2385.79000000,202.98500000,1728049619999,484304.91604800,2977,91.34350000,217919.96349300,0],
[1728049620000,2385.79000000,2385.90000000,2382.99000000,2383.10000000,191.02410000,1728049679999,455426.69897800,2533,68.04080000,162192.76627400,0],
[1728049680000,2383.10000000,2385.28000000,2382.56000000,2383.16000000,212.58300000,1728049739999,506726.49231400,3196,138.93630000,331183.24982400,0],
[1728049740000,2383.16000000,2385.40000000,2383.09000000,2385.40000000,99.55230000,1728049799999,237322.87511600,2426,70.25140000,167475.32759800,0],
[1728049800000,2385.40000000,2387.49000000,2381.54000000,2382.23000000,143.93980000,1728049859999,343236.50741100,3857,84.82350000,202293.54055600,0],
[1728049860000,2382.24000000,2382.80000000,2380.61000000,2382.80000000,103.42140000,1728049919999,246307.21626200,2035,52.33860000,124641.71874600,0],
[1728049920000,2382.80000000,2386.64000000,2382.10000000,2385.75000000,149.23720000,1728049979999,355892.66229700,2368,56.27800000,134176.21185400,0],
[1728049980000,2385.74000000,2387.40000000,2384.65000000,2384.74000000,207.12350000,1728050039999,494205.96651400,4461,80.57650000,192261.31330600,0],
[1728050040000,2384.74000000,2384.74000000,2380.37000000,2381.33000000,151.77500000,1728050099999,361553.40885100,4626,52.42650000,124880.86602300,0],
[1728050100000,2381.34000000,2381.90000000,2379.36000000,2380.72000000,506.33070000,1728050159999,1205188.72501900,5785,167.82710000,399525.81750500,0],
[1728050160000,2380.70000000,2381.80000000,2377.03000000,2377.77000000,592.64230000,1728050219999,1409773.46374400,3164,347.76580000,827144.08916500,0],
[1728050220000,2377.78000000,2378.40000000,2376.16000000,2377.21000000,373.32490000,1728050279999,887434.10789900,2263,160.92950000,382558.13461800,0],
[1728050280000,2377.21000000,2378.60000000,2376.52000000,2378.60000000,228.74670000,1728050339999,543834.05119300,2381,151.36890000,359864.32333500,0],
[1728050340000,2378.60000000,2379.95000000,2377.11000000,2378.59000000,135.71790000,1728050399999,322814.40512400,3805,69.66510000,165704.30989300,0],
[1728050400000,2378.59000000,2379.00000000,2376.40000000,2376.40000000,76.25300000,1728050459999,181318.30851600,2798,30.49000000,72501.52479100,0],
[1728050460000,2376.41000000,2377.10000000,2373.53000000,2376.25000000,297.15030000,1728050519999,705720.90868800,3414,144.19850000,342474.27615000,0],
[1728050520000,2376.25000000,2378.10000000,2373.41000000,2378.00000000,295.22910000,1728050579999,701062.06222100,3179,114.62210000,272203.70152500,0],
[1728050580000,2378.06000000,2380.66000000,2377.10000000,2377.11000000,166.07990000,1728050639999,395079.37964100,2155,111.28520000,264739.90007500,0],
[1728050640000,2377.10000000,2378.55000000,2374.86000000,2375.30000000,116.55970000,1728050699999,276992.11818700,1372,70.92430000,168557.95776200,0],
[1728050700000,2375.30000000,2377.77000000,2375.11000000,2377.54000000,134.37160000,1728050759999,319331.32007600,4111,63.17290000,150119.54765600,0],
[1728050760000,2377.55000000,2381.00000000,2377.02000000,2380.55000000,244.37880000,1728050819999,581235.42881800,5741,92.15560000,219207.63589500,0],
[1728050820000,2380.54000000,2383.30000000,2379.34000000,2380.22000000,165.14620000,1728050879999,393327.75239500,6605,106.95240000,254765.16712100,0],
[1728050880000,2380.22000000,2380.22000000,2371.20000000,2372.40000000,294.69780000,1728050939999,699843.89503800,6129,51.60910000,122509.32761800,0],
[1728050940000,2372.40000000,2374.94000000,2371.50000000,2372.82000000,356.41510000,1728050999999,845820.05573000,5630,138.62790000,328946.71001900,0],
[1728051000000,2372.82000000,2372.82000000,2367.51000000,2368.60000000,733.16580000,1728051059999,1737247.23808700,7933,251.18230000,595154.06276100,0],
[1728051060000,2368.61000000,2369.72000000,2366.00000000,2369.71000000,383.12370000,1728051119999,907179.40133200,6878,104.13720000,246602.87959800,0],
[1728051120000,2369.72000000,2369.96000000,2366.61000000,2369.86000000,196.32810000,1728051179999,464983.83673500,7424,93.24140000,220824.32299600,0],
[1728051180000,2369.86000000,2374.27000000,2369.86000000,2373.59000000,191.95340000,1728051239999,455390.81274400,6778,123.01090000,291789.36515700,0],
[1728051240000,2373.58000000,2374.42000000,2372.91000000,2373.11000000,111.62400000,1728051299999,264979.85345400,5471,35.56900000,84432.96357000,0],
[1728051300000,2373.10000000,2375.67000000,2372.13000000,2374.81000000,148.06830000,1728051359999,351574.25072000,6981,103.50100000,245762.47775300,0],
[1728051360000,2374.80000000,2376.59000000,2373.40000000,2376.59000000,124.46720000,1728051419999,295510.60229300,3949,84.47860000,200576.96415900,0],
[1728051420000,2376.59000000,2376.88000000,2374.02000000,2374.56000000,104.09080000,1728051479999,247277.90396700,2275,62.14680000,147623.50339000,0],
[1728051480000,2374.56000000,2375.50000000,2373.40000000,2374.71000000,122.51130000,1728051539999,290857.95894300,2730,85.39790000,202745.63587000,0],
[1728051540000,2374.71000000,2376.70000000,2374.62000000,2376.36000000,78.45310000,1728051599999,186382.35958100,2214,61.18220000,145351.26741700,0],
[1728051600000,2376.36000000,2376.36000000,2372.27000000,2374.79000000,230.57330000,1728051659999,547485.19386300,3627,146.95040000,348922.64662600,0],
[1728051660000,2374.79000000,2375.51000000,2372.00000000,2374.15000000,248.54900000,1728051719999,590115.88851700,4556,211.53390000,502244.51660900,0],
[1728051720000,2374.16000000,2374.99000000,2370.39000000,2370.56000000,216.05200000,1728051779999,512743.94436700,4327,130.82210000,310481.63591900,0],
[1728051780000,2370.57000000,2370.72000000,2367.40000000,2368.34000000,214.29350000,1728051839999,507672.18742100,2563,109.21470000,258704.27141300,0],
[1728051840000,2368.32000000,2368.32000000,2360.00000000,2362.93000000,1583.60000000,1728051899999,3741707.47426600,4345,841.51510000,1988225.02891400,0],
[1728051900000,2362.92000000,2364.28000000,2361.49000000,2362.79000000,901.47440000,1728051959999,2130324.74263100,3505,649.24830000,1534346.97216800,0],
[1728051960000,2362.72000000,2362.72000000,2357.08000000,2358.21000000,859.17910000,1728052019999,2027117.93930100,5018,146.96270000,346720.72775800,0],
[1728052020000,2358.21000000,2358.31000000,2352.60000000,2355.15000000,1660.60070000,1728052079999,3911559.28517000,6417,619.74630000,1459941.74040100,0],
[1728052080000,2355.15000000,2357.31000000,2353.32000000,2356.19000000,429.41550000,1728052139999,1011312.95279300,4673,127.83340000,301100.66180800,0],
[1728052140000,2356.19000000,2360.79000000,2354.80000000,2359.33000000,1029.06620000,1728052199999,2427298.87004800,4590,481.54490000,1135953.51639400,0],
[1728052200000,2359.33000000,2360.04000000,2355.03000000,2356.78000000,496.01250000,1728052259999,1169375.11410900,4730,237.06480000,558984.30384400,0],
[1728052260000,2356.77000000,2358.13000000,2354.52000000,2356.27000000,492.97580000,1728052319999,1161678.31547400,4488,166.85690000,393138.33244100,0],
[1728052320000,2356.28000000,2358.07000000,2353.61000000,2356.18000000,221.27160000,1728052379999,521256.83266600,3875,127.43110000,300181.61002100,0],
[1728052380000,2356.19000000,2359.09000000,2354.87000000,2356.83000000,374.19750000,1728052439999,881956.50289500,4299,161.05580000,379619.37243400,0],
[1728052440000,2356.82000000,2357.75000000,2355.20000000,2357.50000000,173.05520000,1728052499999,407773.80679800,2668,87.16500000,205383.26271900,0],
[1728052500000,2357.51000000,2359.72000000,2356.90000000,2359.49000000,194.82340000,1728052559999,459482.84755600,2945,132.13640000,311634.22209300,0],
[1728052560000,2359.50000000,2363.44000000,2358.48000000,2361.04000000,441.57120000,1728052619999,1042367.42600300,3793,241.85500000,570861.04255200,0],
[1728052620000,2361.04000000,2361.27000000,2358.59000000,2359.02000000,176.14670000,1728052679999,415608.45426200,2274,65.81690000,155271.63061800,0],
[1728052680000,2359.15000000,2362.06000000,2358.52000000,2360.20000000,139.38320000,1728052739999,329005.68781400,2766,86.08520000,203221.86964300,0],
[1728052740000,2360.18000000,2360.18000000,2356.70000000,2357.69000000,112.03360000,1728052799999,264181.05670900,2243,15.72440000,37072.19813600,0],
[1728052800000,2357.70000000,2362.19000000,2357.69000000,2361.38000000,202.66790000,1728052859999,478321.13509900,3931,88.14980000,208024.30397000,0],
[1728052860000,2361.39000000,2364.70000000,2361.39000000,2362.60000000,134.29380000,1728052919999,317317.32263300,2222,62.29380000,147188.73397100,0],
[1728052920000,2362.60000000,2363.36000000,2361.37000000,2361.37000000,222.27550000,1728052979999,525158.30309600,1839,83.44110000,197126.42513100,0],
[1728052980000,2361.37000000,2363.40000000,2360.61000000,2362.86000000,81.72070000,1728053039999,193081.91880100,1341,67.92590000,160489.27640700,0],
[1728053040000,2362.87000000,2365.36000000,2362.87000000,2365.36000000,83.05460000,1728053099999,196392.99560700,1601,51.57350000,121945.86533100,0],
[1728053100000,2365.36000000,2365.52000000,2363.00000000,2363.07000000,146.50000000,1728053159999,346308.58838000,1932,41.96800000,99215.33128600,0],
[1728053160000,2363.06000000,2365.50000000,2362.97000000,2363.77000000,142.13020000,1728053219999,336011.03516200,2026,43.62690000,103144.48047400,0],
[1728053220000,2363.80000000,2365.37000000,2362.96000000,2363.00000000,57.23670000,1728053279999,135311.97557300,1600,29.34060000,69368.92274400,0],
[1728053280000,2363.00000000,2365.92000000,2362.82000000,2365.92000000,104.35700000,1728053339999,246765.60952700,1474,39.41940000,93199.84222600,0],
[1728053340000,2365.95000000,2368.60000000,2365.95000000,2368.13000000,172.33530000,1728053399999,408024.32986500,1716,140.73400000,333186.67186900,0],
[1728053400000,2368.13000000,2370.69000000,2368.13000000,2368.90000000,163.21240000,1728053459999,386766.23592600,2031,90.50030000,214462.39736700,0],
[1728053460000,2368.90000000,2370.36000000,2367.64000000,2368.09000000,146.96130000,1728053519999,348161.22366100,2691,81.51180000,193093.08219700,0],
[1728053520000,2368.10000000,2370.92000000,2368.10000000,2369.70000000,171.71010000,1728053579999,406861.60451200,1725,85.28710000,202064.00930900,0],
[1728053580000,2369.69000000,2370.60000000,2368.49000000,2368.49000000,162.01030000,1728053639999,383915.82472300,1391,99.19560000,235070.15020000,0],
[1728053640000,2368.41000000,2369.28000000,2366.33000000,2367.53000000,109.24880000,1728053699999,258707.69507400,1864,70.48830000,166921.95875500,0],
[1728053700000,2367.58000000,2368.17000000,2363.30000000,2363.38000000,220.58890000,1728053759999,521792.32771700,1580,30.72920000,72661.04980800,0],
[1728053760000,2363.39000000,2365.28000000,2363.39000000,2364.59000000,67.82090000,1728053819999,160355.13371100,1533,40.96220000,96846.61722400,0],
[1728053820000,2364.60000000,2364.91000000,2363.80000000,2364.39000000,80.33790000,1728053879999,189978.17583400,763,17.93280000,42403.31465400,0],
[1728053880000,2364.39000000,2365.48000000,2363.90000000,2365.48000000,97.37960000,1728053939999,230311.37205300,901,46.89900000,110916.97960100,0],
[1728053940000,2365.48000000,2367.40000000,2365.48000000,2367.21000000,57.86040000,1728053999999,136942.33750000,577,26.40070000,62482.98888300,0],
[1728054000000,2367.21000000,2369.06000000,2366.95000000,2368.40000000,117.11720000,1728054059999,277300.12084000,928,70.17380000,166150.98041700,0],
[1728054060000,2368.39000000,2369.84000000,2367.64000000,2369.52000000,87.66540000,1728054119999,207649.48262500,850,61.59680000,145899.00421000,0],
[1728054120000,2369.52000000,2370.27000000,2368.60000000,2370.11000000,125.60310000,1728054179999,297626.81226300,1289,41.75100000,98928.75969200,0],
[1728054180000,2370.12000000,2373.40000000,2370.11000000,2373.40000000,108.86670000,1728054239999,258230.35685900,1048,93.95610000,222862.85225900,0],
[1728054240000,2373.39000000,2378.41000000,2372.40000000,2378.41000000,591.52960000,1728054299999,1404826.90546600,2276,512.75350000,1217728.52744600,0],
[1728054300000,2378.40000000,2384.20000000,2378.20000000,2384.17000000,588.25930000,1728054359999,1400773.37657000,2915,370.51790000,882354.55199800,0],
[1728054360000,2384.17000000,2386.76000000,2381.34000000,2386.76000000,576.60560000,1728054419999,1374367.82294400,3986,345.94010000,824628.93204000,0],
[1728054420000,2386.77000000,2387.84000000,2384.40000000,2385.04000000,517.94210000,1728054479999,1235887.32106400,3116,302.11630000,720888.95407500,0],
[1728054480000,2385.10000000,2390.93000000,2385.10000000,2389.33000000,489.83410000,1728054539999,1169853.75463600,2996,349.75430000,835249.88255400,0],
[1728054540000,2389.33000000,2389.33000000,2386.38000000,2387.71000000,259.97610000,1728054599999,620702.95889300,2144,146.80270000,350484.99291100,0],
[1728054600000,2387.72000000,2394.40000000,2387.63000000,2391.82000000,608.92000000,1728054659999,1456322.93821500,3882,371.73740000,889050.67455800,0],
[1728054660000,2391.82000000,2391.99000000,2390.05000000,2390.16000000,159.64870000,1728054719999,381728.39713300,2545,78.88940000,188628.33016100,0],
[1728054720000,2390.16000000,2391.50000000,2387.40000000,2389.02000000,424.50050000,1728054779999,1014230.82991200,2171,152.19500000,363665.09222200,0],
[1728054780000,2389.02000000,2390.20000000,2385.40000000,2385.41000000,183.27910000,1728054839999,437611.54970200,2656,80.41360000,192045.36231200,0],
[1728054840000,2385.41000000,2388.19000000,2385.41000000,2387.02000000,289.16620000,1728054899999,690269.43243200,2162,213.30700000,509187.08442200,0],
[1728054900000,2387.01000000,2389.80000000,2385.71000000,2388.50000000,380.53910000,1728054959999,908506.49408500,2656,288.91630000,689764.38859600,0],
[1728054960000,2388.49000000,2393.51000000,2387.87000000,2393.28000000,289.44390000,1728055019999,692034.78264800,1305,212.26480000,507567.53591000,0],
[1728055020000,2393.28000000,2394.00000000,2392.67000000,2393.56000000,305.50070000,1728055079999,731155.44736200,1806,264.78990000,633722.29062600,0],
[1728055080000,2393.56000000,2393.56000000,2391.09000000,2391.65000000,430.62330000,1728055139999,1030304.48818700,2251,183.87360000,439919.16616600,0],
[1728055140000,2391.66000000,2392.77000000,2390.81000000,2392.76000000,179.77690000,1728055199999,430013.36165100,2746,130.48790000,312109.85675800,0],
[1728055200000,2392.77000000,2392.99000000,2388.00000000,2390.18000000,245.01690000,1728055259999,585614.95917800,5143,92.02000000,219870.22251500,0],
[1728055260000,2390.19000000,2395.40000000,2390.19000000,2394.29000000,859.38160000,1728055319999,2057022.54780800,4469,684.45930000,1638320.42629900,0],
[1728055320000,2394.28000000,2394.28000000,2389.72000000,2391.20000000,143.94050000,1728055379999,344306.65020300,3662,76.75930000,183608.15193300,0],
[1728055380000,2391.19000000,2393.00000000,2390.50000000,2392.75000000,228.47670000,1728055439999,546420.26666900,2828,111.43100000,266475.88755100,0],
[1728055440000,2392.76000000,2395.99000000,2392.29000000,2395.75000000,293.45470000,1728055499999,702629.32951800,4433,234.32950000,561058.04237700,0],
[1728055500000,2395.71000000,2395.71000000,2390.90000000,2390.97000000,370.32610000,1728055559999,886522.55637200,4295,200.30500000,479528.78281100,0],
[1728055560000,2390.92000000,2390.92000000,2388.64000000,2388.64000000,193.19730000,1728055619999,461596.34178100,3828,72.53210000,173295.21947500,0],
[1728055620000,2388.62000000,2389.00000000,2386.88000000,2388.61000000,118.06520000,1728055679999,281900.09584000,2561,46.58550000,111236.83653500,0],
[1728055680000,2388.60000000,2388.88000000,2386.36000000,2387.79000000,143.79880000,1728055739999,343255.08120100,2456,104.06810000,248393.35219000,0],
[1728055740000,2387.79000000,2388.84000000,2386.92000000,2387.50000000,96.02060000,1728055799999,229299.59314300,2357,59.41170000,141873.90759400,0],
[1728055800000,2387.50000000,2387.50000000,2384.40000000,2385.30000000,114.54980000,1728055859999,273330.59361400,3344,44.90680000,107149.44276000,0],
[1728055860000,2385.30000000,2386.92000000,2384.61000000,2385.00000000,1798.94270000,1728055919999,4291532.19713000,2462,958.34880000,2286149.01086200,0],
[1728055920000,2384.99000000,2386.86000000,2384.70000000,2386.67000000,598.48870000,1728055979999,1427768.43378900,2969,472.04400000,1126115.07136800,0],
[1728055980000,2386.68000000,2388.12000000,2385.04000000,2386.20000000,505.63160000,1728056039999,1207031.31360800,4307,452.01780000,1079098.47768200,0],
[1728056040000,2386.21000000,2391.50000000,2385.20000000,2389.80000000,609.35500000,1728056099999,1455592.40189100,5623,466.72030000,1114779.25296500,0],
[1728056100000,2389.81000000,2391.24000000,2389.63000000,2390.61000000,81.81360000,1728056159999,195556.82383000,3491,59.84490000,143035.37635900,0],
[1728056160000,2390.60000000,2391.51000000,2389.00000000,2389.48000000,254.06440000,1728056219999,607320.72653900,3910,143.99220000,344165.03810300,0],
[1728056220000,2389.47000000,2390.30000000,2387.60000000,2388.09000000,123.25620000,1728056279999,294431.79096800,3285,60.00900000,143344.83206500,0],
[1728056280000,2388.10000000,2389.26000000,2386.80000000,2386.80000000,165.12930000,1728056339999,394379.74442400,1761,61.71560000,147427.95702800,0],
[1728056340000,2386.80000000,2387.08000000,2385.00000000,2386.81000000,452.60680000,1728056399999,1080130.00060400,3354,179.66540000,428745.61477500,0],
[1728056400000,2386.80000000,2388.17000000,2386.63000000,2387.06000000,91.82380000,1728056459999,219214.18478400,1650,42.32920000,101047.30170800,0],
[1728056460000,2387.07000000,2389.33000000,2385.00000000,2389.32000000,604.84230000,1728056519999,1443561.14147400,3970,172.57380000,411973.10544900,0],
[1728056520000,2389.33000000,2392.52000000,2389.32000000,2392.32000000,239.09710000,1728056579999,571834.68237600,2646,202.48140000,484253.00341800,0],
[1728056580000,2392.33000000,2392.40000000,2389.51000000,2389.51000000,124.17600000,1728056639999,296890.71947300,2675,42.44580000,101482.50960500,0],
[1728056640000,2389.51000000,2392.19000000,2388.94000000,2391.61000000,573.62400000,1728056699999,1371415.15843800,2099,499.50100000,1194137.03849100,0],
[1728056700000,2391.60000000,2391.60000000,2390.05000000,2390.25000000,117.51780000,1728056759999,280988.20759300,1154,29.29680000,70047.68821300,0],
[1728056760000,2390.25000000,2393.62000000,2390.24000000,2392.66000000,963.39230000,1728056819999,2304751.42357700,3815,826.01250000,1976005.63733000,0],
[1728056820000,2392.66000000,2394.12000000,2392.40000000,2393.10000000,168.55980000,1728056879999,403418.81337700,2854,138.72050000,331997.42870300,0],
[1728056880000,2393.10000000,2393.10000000,2390.86000000,2391.21000000,179.00620000,1728056939999,428199.07581500,2182,45.06720000,107779.89765200,0],
[1728056940000,2391.21000000,2393.06000000,2387.64000000,2390.38000000,2141.11320000,1728056999999,5118909.49726700,8178,1399.72380000,3346071.92594200,0],
[1728057000000,2390.38000000,2390.38000000,2388.01000000,2388.01000000,81.02760000,1728057059999,193584.91721500,3839,23.47430000,56077.44870100,0],
[1728057060000,2388.02000000,2392.06000000,2388.02000000,2390.96000000,183.98150000,1728057119999,439671.19962200,2843,131.14350000,313361.53505300,0],
[1728057120000,2390.96000000,2394.60000000,2390.33000000,2393.80000000,990.79250000,1728057179999,2370861.51018800,3963,890.25470000,2130234.72796200,0],
[1728057180000,2393.80000000,2395.99000000,2393.80000000,2395.99000000,326.16730000,1728057239999,781163.74189800,3970,173.77320000,416163.99912000,0],
[1728057240000,2395.99000000,2397.97000000,2395.99000000,2397.42000000,206.84320000,1728057299999,495804.56532500,3310,143.93680000,345010.36236400,0],
[1728057300000,2397.42000000,2407.50000000,2397.25000000,2407.20000000,2108.09680000,1728057359999,5067567.97622300,11807,1400.36240000,3365343.26313800,0],
[1728057360000,2407.21000000,2411.04000000,2406.00000000,2410.45000000,1840.95230000,1728057419999,4434436.45970300,10468,1207.01920000,2907208.13266800,0],
[1728057420000,2410.45000000,2417.35000000,2410.20000000,2414.94000000,1367.21340000,1728057479999,3300974.25199800,11552,785.86180000,1897163.50974600,0],
[1728057480000,2414.95000000,2417.72000000,2411.96000000,2416.65000000,1383.27470000,1728057539999,3340326.42930200,4608,1114.06430000,2690243.37363500,0],
[1728057540000,2416.64000000,2418.41000000,2414.55000000,2417.05000000,436.90990000,1728057599999,1055776.28175500,4769,217.40320000,525318.71455700,0],
[1728057600000,2417.10000000,2422.38000000,2415.60000000,2420.53000000,1308.17830000,1728057659999,3164933.36288000,8510,841.96840000,2037029.43076300,0],
[1728057660000,2420.53000000,2423.56000000,2419.41000000,2419.83000000,685.01360000,1728057719999,1659002.96729500,7483,236.87540000,573615.92812300,0],
[1728057720000,2419.84000000,2421.60000000,2417.50000000,2418.68000000,439.86750000,1728057779999,1064272.92115500,6410,167.64360000,405624.31541000,0],
[1728057780000,2418.69000000,2418.90000000,2415.22000000,2416.75000000,222.11150000,1728057839999,536869.13411000,3786,89.20700000,215635.45324400,0],
[1728057840000,2416.75000000,2416.75000000,2414.83000000,2415.79000000,233.74340000,1728057899999,564617.30735400,3157,120.92550000,292108.82143700,0],
[1728057900000,2415.79000000,2419.63000000,2415.70000000,2418.33000000,321.76990000,1728057959999,778027.49549200,3888,220.27050000,532561.84910700,0],
[1728057960000,2418.33000000,2420.53000000,2417.17000000,2420.02000000,258.67400000,1728058019999,625664.57227100,4817,199.43180000,482396.68658100,0],
[1728058020000,2420.01000000,2422.92000000,2420.01000000,2421.59000000,320.31380000,1728058079999,775741.44525400,3826,187.02590000,452931.87461000,0],
[1728058080000,2421.58000000,2422.00000000,2418.63000000,2419.59000000,254.29270000,1728058139999,615494.44237800,3557,91.32460000,221038.28798100,0],
[1728058140000,2419.59000000,2419.73000000,2413.40000000,2414.39000000,281.61160000,1728058199999,680489.52980800,4031,156.62150000,378456.06305400,0],
[1728058200000,2414.40000000,2417.80000000,2414.03000000,2416.93000000,343.75870000,1728058259999,830645.79251900,2208,252.18790000,609353.61103400,0],
[1728058260000,2416.99000000,2419.67000000,2416.62000000,2419.59000000,268.43120000,1728058319999,649032.32246200,2708,223.97800000,541512.88071200,0],
[1728058320000,2419.60000000,2419.99000000,2417.58000000,2417.70000000,200.78270000,1728058379999,485589.97528900,2718,57.77340000,139754.79972200,0],
[1728058380000,2417.71000000,2421.00000000,2417.60000000,2420.26000000,197.32890000,1728058439999,477407.50192300,2437,145.05590000,350925.42599100,0],
[1728058440000,2420.25000000,2420.25000000,2418.00000000,2418.82000000,151.02040000,1728058499999,365276.67309100,1757,106.63980000,257934.80003100,0],
[1728058500000,2418.84000000,2419.80000000,2417.54000000,2417.80000000,138.66260000,1728058559999,335404.71828900,2070,67.70340000,163766.80755200,0],
[1728058560000,2417.81000000,2420.00000000,2417.20000000,2420.00000000,644.36740000,1728058619999,1559054.36599600,1374,357.32350000,864488.79654800,0],
[1728058620000,2419.99000000,2426.71000000,2419.98000000,2425.78000000,1289.59490000,1728058679999,3125008.64327200,3781,1054.92420000,2555959.28533900,0],
[1728058680000,2425.78000000,2430.34000000,2424.80000000,2427.62000000,1072.93510000,1728058739999,2605153.80435800,5081,750.07260000,1821138.88866600,0],
[1728058740000,2427.61000000,2435.22000000,2426.81000000,2430.80000000,964.08890000,1728058799999,2344919.34423600,5817,623.59480000,1516594.02888800,0],
[1728058800000,2430.81000000,2430.96000000,2429.20000000,2430.44000000,342.46230000,1728058859999,832135.46002900,1818,169.68270000,412292.32495900,0],
[1728058860000,2430.43000000,2433.00000000,2429.12000000,2429.12000000,1435.43930000,1728058919999,3490227.43991700,3130,707.94190000,1721210.29833000,0],
[1728058920000,2429.13000000,2433.20000000,2429.13000000,2433.13000000,482.47560000,1728058979999,1173146.00328500,5080,254.79380000,619466.18772500,0],
[1728058980000,2433.12000000,2436.40000000,2432.40000000,2434.81000000,514.46540000,1728059039999,1252398.61849900,5449,218.81020000,532786.55271600,0],
[1728059040000,2434.80000000,2437.77000000,2434.40000000,2434.94000000,614.93510000,1728059099999,1498270.80488000,7641,287.84580000,701231.09433900,0],
[1728059100000,2434.94000000,2434.95000000,2432.20000000,2432.41000000,628.81190000,1728059159999,1530243.43279100,4622,192.92190000,469491.24819300,0],
[1728059160000,2432.41000000,2432.79000000,2429.40000000,2431.60000000,199.39160000,1728059219999,484781.02825100,3539,59.43030000,144471.53095300,0],
[1728059220000,2431.60000000,2432.74000000,2429.80000000,2432.73000000,136.39000000,1728059279999,331601.54295400,3291,90.64470000,220385.99839300,0],
[1728059280000,2432.74000000,2433.01000000,2430.00000000,2433.01000000,514.71250000,1728059339999,1251242.12514700,3830,316.82460000,770231.75574600,0],
[1728059340000,2433.01000000,2435.69000000,2433.01000000,2434.40000000,444.30020000,1728059399999,1081526.99883900,3947,258.25960000,628706.85011000,0],
[1728059400000,2434.40000000,2440.10000000,2434.16000000,2440.09000000,607.10460000,1728059459999,1479957.65995000,4614,430.05680000,1048367.39465700,0],
[1728059460000,2440.10000000,2440.97000000,2436.75000000,2440.79000000,2089.38450000,1728059519999,5095983.67849500,6620,502.28420000,1224950.20497700,0],
[1728059520000,2440.78000000,2441.64000000,2439.27000000,2439.27000000,466.16010000,1728059579999,1137633.06685700,5973,188.55110000,460162.30541300,0],
[1728059580000,2439.27000000,2439.50000000,2437.16000000,2438.42000000,376.11210000,1728059639999,917120.45540300,5479,178.55710000,435363.65112500,0],
[1728059640000,2438.41000000,2439.50000000,2438.00000000,2439.02000000,394.58410000,1728059699999,962260.23314300,4589,255.64590000,623437.39887000,0],
[1728059700000,2439.02000000,2439.78000000,2434.50000000,2438.01000000,1353.08950000,1728059759999,3297997.92401600,7740,535.55680000,1305220.44185100,0],
[1728059760000,2438.02000000,2440.91000000,2438.02000000,2440.86000000,363.97000000,1728059819999,887970.59078800,3403,228.02110000,556323.28111800,0],
[1728059820000,2440.87000000,2441.00000000,2435.61000000,2437.09000000,393.05550000,1728059879999,958516.40781400,6340,210.89750000,514281.88165400,0],
[1728059880000,2437.10000000,2438.00000000,2435.75000000,2435.75000000,243.15400000,1728059939999,592544.27661700,4193,127.61870000,310960.86351200,0],
[1728059940000,2435.76000000,2437.91000000,2434.83000000,2436.90000000,462.96910000,1728059999999,1128137.11245700,5058,299.35950000,729494.34824900,0],
[1728060000000,2436.89000000,2437.67000000,2434.86000000,2435.41000000,492.64520000,1728060059999,1200285.57282000,4033,339.08750000,826136.65538600,0],
[1728060060000,2435.40000000,2435.78000000,2430.40000000,2431.39000000,478.17390000,1728060119999,1163220.34291400,4896,273.43340000,665053.32200800,0],
[1728060120000,2431.39000000,2433.95000000,2430.50000000,2433.95000000,505.53450000,1728060179999,1229612.63448000,3862,366.24850000,890878.67502200,0],
[1728060180000,2433.95000000,2434.75000000,2432.20000000,2432.60000000,113.30660000,1728060239999,275759.98213800,4035,42.14820000,102577.16324500,0],
[1728060240000,2432.61000000,2432.73000000,2431.20000000,2431.60000000,210.72050000,1728060299999,512458.91367300,2768,70.06850000,170381.93698300,0],
[1728060300000,2431.59000000,2434.00000000,2430.73000000,2432.81000000,145.01380000,1728060359999,352720.34163900,2954,45.25650000,110071.10510300,0],
[1728060360000,2432.80000000,2433.11000000,2430.83000000,2430.83000000,169.48940000,1728060419999,412166.11418700,2385,46.05500000,111993.35825600,0],
[1728060420000,2430.84000000,2431.40000000,2430.17000000,2430.24000000,164.85980000,1728060479999,400721.83447000,2535,87.04940000,211592.35382900,0],
[1728060480000,2430.24000000,2432.00000000,2430.24000000,2431.80000000,256.81000000,1728060539999,624284.62245800,1530,141.22740000,343319.98712200,0],
[1728060540000,2431.81000000,2433.00000000,2430.86000000,2432.72000000,224.56640000,1728060599999,546097.40765000,1792,105.17680000,255763.69312200,0],
[1728060600000,2432.72000000,2435.75000000,2432.47000000,2432.48000000,138.52350000,1728060659999,337141.69603900,2526,104.85670000,255192.10834100,0],
[1728060660000,2432.48000000,2433.00000000,2430.00000000,2430.89000000,111.89350000,1728060719999,272024.71064300,1935,55.67560000,135346.09277700,0],
[1728060720000,2430.89000000,2432.16000000,2430.50000000,2431.40000000,245.10170000,1728060779999,595981.56161800,2321,195.08740000,474385.26728700,0],
[1728060780000,2431.40000000,2433.72000000,2431.40000000,2433.10000000,152.02160000,1728060839999,369835.28236200,1750,106.57500000,259253.33971200,0],
[1728060840000,2433.10000000,2433.22000000,2431.90000000,2432.29000000,89.75470000,1728060899999,218337.40036500,892,47.57550000,115726.87975900,0],
[1728060900000,2432.28000000,2433.54000000,2430.19000000,2433.54000000,104.67030000,1728060959999,254530.29621000,1639,44.01510000,107044.61560300,0],
[1728060960000,2433.53000000,2434.20000000,2433.00000000,2433.18000000,146.76060000,1728061019999,357167.86140400,1138,73.45990000,178772.78907900,0],
[1728061020000,2433.18000000,2434.30000000,2432.20000000,2434.19000000,129.42890000,1728061079999,314964.30189800,1136,79.80960000,194207.76496100,0],
[1728061080000,2434.19000000,2434.19000000,2431.37000000,2432.74000000,146.97040000,1728061139999,357627.56900700,2768,30.08180000,73199.42014200,0],
[1728061140000,2432.74000000,2434.50000000,2432.73000000,2433.73000000,173.95590000,1728061199999,423365.54533000,1298,126.05430000,306770.65601500,0],
[1728061200000,2433.73000000,2434.00000000,2431.31000000,2432.68000000,192.28880000,1728061259999,467888.80940100,2970,42.73540000,103983.14137300,0],
[1728061260000,2432.67000000,2433.59000000,2431.74000000,2433.42000000,53.07760000,1728061319999,129143.60591400,1668,18.39460000,44752.02615500,0],
[1728061320000,2433.43000000,2434.50000000,2431.90000000,2432.09000000,148.47980000,1728061379999,361262.49098300,2385,40.89890000,99497.11141900,0],
[1728061380000,2432.08000000,2436.33000000,2432.08000000,2435.77000000,178.76680000,1728061439999,435211.55064700,2881,108.64520000,264517.21947900,0],
[1728061440000,2435.77000000,2436.76000000,2435.28000000,2436.07000000,104.78470000,1728061499999,255242.97375500,1286,75.37380000,183591.49512700,0],
[1728061500000,2436.06000000,2436.16000000,2435.00000000,2435.30000000,99.46380000,1728061559999,242237.72738200,2115,40.57840000,98817.13967100,0],
[1728061560000,2435.30000000,2436.16000000,2435.10000000,2436.16000000,121.59590000,1728061619999,296144.03942200,1599,49.37320000,120245.61020400,0],
[1728061620000,2436.16000000,2437.40000000,2436.16000000,2437.09000000,55.00720000,1728061679999,134037.62428000,1736,38.29350000,93309.02439900,0],
[1728061680000,2437.09000000,2437.09000000,2435.11000000,2435.84000000,96.40800000,1728061739999,234862.56426500,911,60.40260000,147136.03522600,0],
[1728061740000,2435.84000000,2436.76000000,2435.11000000,2435.12000000,62.46690000,1728061799999,152157.46580000,583,31.79690000,77452.88446000,0],
[1728061800000,2435.12000000,2435.80000000,2434.74000000,2435.59000000,102.65210000,1728061859999,250000.45384800,859,24.98250000,60840.21633800,0],
[1728061860000,2435.60000000,2435.73000000,2432.21000000,2432.27000000,202.50210000,1728061919999,492952.27495600,1625,38.27690000,93144.81797900,0],
[1728061920000,2432.27000000,2432.56000000,2428.60000000,2430.38000000,419.46860000,1728061979999,1019446.49316400,1944,94.23940000,229006.45350400,0],
[1728061980000,2430.39000000,2431.32000000,2426.10000000,2426.18000000,281.37760000,1728062039999,683175.53747600,2762,66.07250000,160375.64648000,0],
[1728062040000,2426.19000000,2428.04000000,2426.18000000,2427.45000000,106.04780000,1728062099999,257393.47443000,1213,46.77830000,113537.53098900,0],
[1728062100000,2427.44000000,2428.72000000,2427.20000000,2428.29000000,78.52240000,1728062159999,190636.01225500,961,24.19240000,58733.22187800,0],
[1728062160000,2428.29000000,2429.66000000,2427.80000000,2429.66000000,75.74110000,1728062219999,183968.75965700,888,63.24390000,153616.88952800,0],
[1728062220000,2429.66000000,2429.73000000,2427.11000000,2427.53000000,164.24910000,1728062279999,398774.53113300,1054,125.20810000,303975.70495500,0],
[1728062280000,2427.54000000,2427.89000000,2427.11000000,2427.60000000,100.85170000,1728062339999,244827.05309900,1916,34.14020000,82876.22990600,0],
[1728062340000,2427.60000000,2427.88000000,2425.99000000,2426.00000000,85.68170000,1728062399999,207904.72293100,2037,33.80480000,82016.09659100,0],
[1728062400000,2426.00000000,2427.80000000,2426.00000000,2427.80000000,97.15320000,1728062459999,235777.71076600,1353,69.47200000,168581.29984500,0],
[1728062460000,2427.80000000,2427.80000000,2425.18000000,2425.49000000,45.82410000,1728062519999,111169.07154600,2167,16.21780000,39338.64448200,0],
[1728062520000,2425.50000000,2426.40000000,2425.49000000,2426.00000000,275.91180000,1728062579999,669363.02118300,609,213.50360000,517963.90715100,0],
[1728062580000,2426.00000000,2426.10000000,2425.30000000,2425.44000000,69.48080000,1728062639999,168539.77390400,739,21.94390000,53228.44041300,0],
[1728062640000,2425.43000000,2425.44000000,2424.44000000,2424.45000000,103.08200000,1728062699999,249988.24188800,1031,18.39030000,44600.26788200,0],
[1728062700000,2424.45000000,2425.04000000,2423.70000000,2423.71000000,129.06310000,1728062759999,312907.48049300,1240,45.77360000,110970.32032600,0],
[1728062760000,2423.70000000,2424.07000000,2423.27000000,2423.99000000,84.00750000,1728062819999,203603.07701600,899,38.34460000,92931.86833100,0],
[1728062820000,2423.98000000,2423.98000000,2421.10000000,2422.00000000,134.23370000,1728062879999,325135.90082600,1613,48.66290000,117864.33405400,0],
[1728062880000,2422.00000000,2423.93000000,2422.00000000,2423.93000000,101.27010000,1728062939999,245383.93317700,499,34.29850000,83104.42231800,0],
[1728062940000,2423.93000000,2423.93000000,2422.50000000,2423.07000000,36.07000000,1728062999999,87407.19331700,1248,18.19240000,44083.95952000,0],
[1728063000000,2423.08000000,2423.69000000,2420.34000000,2420.34000000,148.67030000,1728063059999,360184.25514600,2579,36.95120000,89534.13699600,0],
[1728063060000,2420.34000000,2422.20000000,2419.84000000,2422.20000000,94.32720000,1728063119999,228354.64732200,1028,27.45200000,66474.06155600,0],
[1728063120000,2422.19000000,2423.69000000,2421.36000000,2423.68000000,225.29740000,1728063179999,545759.72676400,1151,66.10660000,160114.20851600,0],
[1728063180000,2423.69000000,2423.69000000,2420.16000000,2420.65000000,126.90000000,1728063239999,307323.16703500,1842,20.12890000,48735.10989700,0],
[1728063240000,2420.65000000,2420.65000000,2417.57000000,2417.58000000,1087.21330000,1728063299999,2629256.63143100,2574,130.30100000,315088.67250900,0],
[1728063300000,2417.58000000,2417.89000000,2414.60000000,2414.99000000,3199.93930000,1728063359999,7730886.41741600,4469,718.44580000,1735608.83544200,0],
[1728063360000,2415.00000000,2416.50000000,2413.85000000,2416.50000000,1061.40390000,1728063419999,2562848.10098100,2725,281.66440000,680084.57509900,0],
[1728063420000,2416.50000000,2416.65000000,2409.67000000,2412.70000000,340.20370000,1728063479999,820703.04258400,5391,119.89870000,289183.86323600,0],
[1728063480000,2412.69000000,2414.27000000,2411.40000000,2414.10000000,182.63330000,1728063539999,440597.62619900,3203,66.77240000,161090.24395100,0],
[1728063540000,2414.10000000,2416.40000000,2414.10000000,2415.83000000,156.48730000,1728063599999,377980.47553000,1920,130.79660000,315918.66359800,0],
[1728063600000,2415.81000000,2416.20000000,2415.00000000,2415.50000000,30.99720000,1728063659999,74871.90229200,1802,14.23260000,34376.98131500,0],
[1728063660000,2415.50000000,2418.87000000,2415.50000000,2417.63000000,191.10470000,1728063719999,462048.02528800,1976,116.15620000,280810.63022500,0],
[1728063720000,2417.63000000,2420.00000000,2417.62000000,2420.00000000,66.08820000,1728063779999,159860.66454800,1239,59.77560000,144588.91962600,0],
[1728063780000,2420.00000000,2422.40000000,2420.00000000,2420.76000000,160.29910000,1728063839999,388127.08346400,1403,83.31090000,201704.68631200,0],
[1728063840000,2420.75000000,2420.76000000,2419.60000000,2420.06000000,226.33740000,1728063899999,547775.98743600,1176,81.25030000,196624.32881000,0],
[1728063900000,2420.06000000,2420.55000000,2418.94000000,2419.14000000,139.59950000,1728063959999,337824.38012100,2356,66.20730000,160211.33820000,0],
[1728063960000,2419.12000000,2419.12000000,2417.65000000,2418.70000000,75.34590000,1728064019999,182235.95362600,2572,53.58250000,129599.08500800,0],
[1728064020000,2418.70000000,2419.40000000,2416.71000000,2419.40000000,103.95260000,1728064079999,251354.58349900,1860,72.73480000,175857.10404800,0],
[1728064080000,2419.39000000,2420.53000000,2418.90000000,2419.80000000,182.10320000,1728064139999,440687.95467900,1697,55.67590000,134730.45439600,0],
[1728064140000,2419.79000000,2420.22000000,2418.45000000,2418.94000000,81.04080000,1728064199999,196074.71369800,2242,21.12660000,51110.67312800,0],
[1728064200000,2418.93000000,2419.43000000,2417.53000000,2418.11000000,44.34770000,1728064259999,107255.53507500,1714,15.67530000,37909.84399800,0],
[1728064260000,2418.10000000,2418.97000000,2417.42000000,2418.00000000,52.24520000,1728064319999,126332.07718400,1843,19.02400000,46002.33503200,0],
[1728064320000,2418.00000000,2418.20000000,2416.07000000,2417.05000000,75.82870000,1728064379999,183287.81738900,3108,29.87760000,72217.75677300,0],
[1728064380000,2417.05000000,2417.06000000,2415.46000000,2415.90000000,109.93150000,1728064439999,265611.36959800,1537,12.48390000,30160.57352600,0],
[1728064440000,2415.90000000,2416.40000000,2415.40000000,2416.06000000,35.67020000,1728064499999,86171.09879100,1127,18.10080000,43728.34204800,0],
[1728064500000,2416.06000000,2416.30000000,2415.53000000,2415.64000000,54.54950000,1728064559999,131780.81163100,945,13.10970000,31670.78931700,0],
[1728064560000,2415.64000000,2415.80000000,2415.05000000,2415.80000000,143.97380000,1728064619999,347733.08303500,948,89.59200000,216389.83593900,0],
[1728064620000,2415.79000000,2417.66000000,2415.69000000,2417.66000000,251.18390000,1728064679999,606885.52630400,848,74.94110000,181078.39823300,0],
[1728064680000,2417.65000000,2417.65000000,2416.70000000,2417.10000000,60.06370000,1728064739999,145179.92068800,741,20.10530000,48597.34117300,0],
[1728064740000,2417.09000000,2417.10000000,2415.24000000,2415.25000000,49.59920000,1728064799999,119820.49468600,771,10.97380000,26509.21087200,0],
[1728064800000,2415.25000000,2415.60000000,2414.25000000,2414.80000000,108.05440000,1728064859999,260959.65304100,1241,14.68150000,35451.80668600,0],
[1728064860000,2414.80000000,2415.81000000,2414.80000000,2414.80000000,51.63090000,1728064919999,124701.67491800,888,25.08550000,60587.27365300,0],
[1728064920000,2414.80000000,2415.20000000,2413.40000000,2414.00000000,72.15830000,1728064979999,174204.83976500,902,25.77430000,62230.79343300,0],
[1728064980000,2413.99000000,2413.99000000,2412.98000000,2412.98000000,75.06640000,1728065039999,181146.44323400,641,8.51300000,20542.68253200,0],
[1728065040000,2412.98000000,2413.31000000,2412.20000000,2412.32000000,108.29320000,1728065099999,261294.66834500,829,44.12190000,106462.32594600,0],
[1728065100000,2412.32000000,2412.33000000,2411.00000000,2411.90000000,132.58840000,1728065159999,319746.59360900,1179,42.85600000,103345.84532800,0],
[1728065160000,2411.89000000,2412.43000000,2409.99000000,2411.30000000,917.34650000,1728065219999,2211272.65659800,1308,313.30570000,755103.96156900,0],
[1728065220000,2411.31000000,2413.80000000,2411.30000000,2413.80000000,54.39040000,1728065279999,131226.57504800,690,40.05290000,96624.45329000,0],
[1728065280000,2413.79000000,2416.20000000,2413.79000000,2415.80000000,78.64410000,1728065339999,189931.48804800,1186,39.19010000,94646.39919700,0],
[1728065340000,2415.80000000,2416.16000000,2415.41000000,2416.16000000,37.01420000,1728065399999,89417.69637800,486,18.14090000,43824.68923100,0],
[1728065400000,2416.15000000,2416.15000000,2414.45000000,2414.46000000,42.42590000,1728065459999,102477.03568500,681,8.70810000,21030.33363600,0],
[1728065460000,2414.45000000,2414.45000000,2413.64000000,2413.64000000,30.68470000,1728065519999,74075.68435800,685,5.16100000,12457.93385000,0],
[1728065520000,2413.64000000,2414.20000000,2413.12000000,2414.20000000,73.82290000,1728065579999,178170.54175900,792,18.67960000,45082.63344900,0],
[1728065580000,2414.19000000,2414.34000000,2413.63000000,2413.94000000,81.89990000,1728065639999,197697.11317200,425,9.12800000,22035.10325600,0],
[1728065640000,2413.94000000,2416.10000000,2413.94000000,2414.90000000,384.77890000,1728065699999,929229.37516200,1712,261.50220000,631494.18101200,0],
[1728065700000,2414.91000000,2415.51000000,2413.71000000,2414.45000000,70.80280000,1728065759999,170953.97528300,779,17.58840000,42468.61003000,0],
[1728065760000,2414.45000000,2415.65000000,2413.71000000,2415.03000000,109.95860000,1728065819999,265529.88125800,1879,34.67460000,83723.54996800,0],
[1728065820000,2415.02000000,2416.20000000,2414.76000000,2416.19000000,28.51080000,1728065879999,68870.95467400,1759,11.85180000,28628.20677700,0],
[1728065880000,2416.19000000,2418.20000000,2416.19000000,2417.66000000,106.46010000,1728065939999,257355.37926800,1793,90.08760000,217772.30329100,0],
[1728065940000,2417.66000000,2418.66000000,2417.65000000,2417.65000000,27.72620000,1728065999999,67041.65329700,1216,13.40310000,32409.13677800,0],
[1728066000000,2417.66000000,2419.52000000,2417.65000000,2418.93000000,54.53050000,1728066059999,131881.79480900,1016,34.44760000,83307.00077900,0],
[1728066060000,2418.92000000,2419.71000000,2418.00000000,2418.65000000,139.18270000,1728066119999,336641.65558900,1826,87.17000000,210830.85276400,0],
[1728066120000,2418.65000000,2420.55000000,2418.65000000,2420.27000000,142.73700000,1728066179999,345392.32141400,1019,108.15370000,261691.35200300,0],
[1728066180000,2420.27000000,2420.54000000,2417.23000000,2418.20000000,250.55220000,1728066239999,606116.01371900,1666,59.94610000,145049.42373700,0],
[1728066240000,2418.19000000,2419.66000000,2417.97000000,2418.41000000,83.71620000,1728066299999,202482.02577900,1867,30.50260000,73761.95234200,0],
[1728066300000,2418.41000000,2420.00000000,2418.40000000,2419.39000000,83.87430000,1728066359999,202932.06278100,1845,61.37110000,148484.90234500,0],
[1728066360000,2419.39000000,2419.67000000,2418.05000000,2419.44000000,156.00210000,1728066419999,377357.34714900,1872,73.58270000,177998.12790400,0],
[1728066420000,2419.44000000,2419.67000000,2417.74000000,2419.66000000,65.93130000,1728066479999,159464.98890600,1854,39.47840000,95479.35437500,0],
[1728066480000,2419.66000000,2420.20000000,2419.26000000,2419.26000000,33.75640000,1728066539999,81685.47096800,748,19.85230000,48039.92318300,0],
[1728066540000,2419.27000000,2420.20000000,2418.99000000,2420.19000000,104.68500000,1728066599999,253264.14021300,510,94.92070000,229640.93988200,0],
[1728066600000,2420.20000000,2421.68000000,2420.20000000,2420.67000000,74.00580000,1728066659999,179165.42381100,1646,35.06210000,84877.13319900,0],
[1728066660000,2420.68000000,2421.10000000,2419.87000000,2420.83000000,48.06240000,1728066719999,116337.46150600,1500,16.76800000,40584.54342900,0],
[1728066720000,2420.84000000,2422.48000000,2420.83000000,2421.79000000,72.02370000,1728066779999,174441.85572800,1243,55.72670000,134969.35845900,0],
[1728066780000,2421.80000000,2424.52000000,2421.80000000,2423.97000000,145.61080000,1728066839999,352821.63403400,1896,128.99640000,312558.53479100,0],
[1728066840000,2423.98000000,2424.52000000,2422.90000000,2424.52000000,134.24030000,1728066899999,325348.50999600,2126,97.04840000,235206.87873500,0],
[1728066900000,2424.53000000,2425.30000000,2423.86000000,2425.20000000,86.84820000,1728066959999,210571.16418400,1888,60.26140000,146104.53400500,0],
[1728066960000,2425.20000000,2425.21000000,2424.22000000,2424.22000000,37.35580000,1728067019999,90572.93048100,449,11.52460000,27941.56273000,0],
[1728067020000,2424.23000000,2429.64000000,2424.22000000,2427.00000000,548.08470000,1728067079999,1331016.70615900,5324,356.92490000,866686.85434200,0],
[1728067080000,2427.00000000,2427.35000000,2425.70000000,2427.08000000,113.28920000,1728067139999,274920.27390400,2117,79.87400000,193833.96376400,0],
[1728067140000,2427.09000000,2427.09000000,2425.91000000,2425.91000000,38.92420000,1728067199999,94454.28107300,557,20.68330000,50192.22311800,0],
[1728067200000,2425.90000000,2427.71000000,2425.90000000,2427.21000000,79.74860000,1728067259999,193509.41853100,1582,66.00520000,160155.65855600,0],
[1728067260000,2427.21000000,2429.73000000,2427.19000000,2428.90000000,416.95700000,1728067319999,1012420.60176600,2679,326.26500000,792194.32568700,0],
[1728067320000,2428.90000000,2429.73000000,2428.18000000,2428.18000000,66.67010000,1728067379999,161944.17818700,891,36.35870000,88320.73106600,0],
[1728067380000,2428.19000000,2428.19000000,2425.90000000,2425.90000000,49.89800000,1728067439999,121124.19305800,994,4.42330000,10738.46368100,0],
[1728067440000,2425.90000000,2425.91000000,2425.00000000,2425.01000000,62.39690000,1728067499999,151336.36017800,887,27.86310000,67576.34595700,0],
[1728067500000,2425.01000000,2426.37000000,2424.90000000,2426.20000000,42.02370000,1728067559999,101932.06460300,2616,26.83670000,65095.15149000,0],
[1728067560000,2426.21000000,2427.34000000,2425.89000000,2427.34000000,40.72830000,1728067619999,98830.57361800,1304,35.67250000,86563.93911500,0],
[1728067620000,2427.34000000,2428.00000000,2426.20000000,2426.48000000,67.80960000,1728067679999,164557.96970600,1731,18.79660000,45613.87962300,0],
[1728067680000,2426.48000000,2426.76000000,2425.44000000,2425.44000000,21.69000000,1728067739999,52621.54878200,955,8.13680000,19743.25000800,0],
[1728067740000,2425.45000000,2425.45000000,2423.77000000,2424.76000000,67.46410000,1728067799999,163587.37882100,1341,18.72170000,45386.15094000,0],
[1728067800000,2424.77000000,2426.43000000,2424.77000000,2426.23000000,76.11970000,1728067859999,184673.54799400,1661,52.51850000,127415.22423500,0],
[1728067860000,2426.24000000,2426.93000000,2425.21000000,2426.92000000,38.96250000,1728067919999,94535.37102300,1511,29.24030000,70949.02405200,0],
[1728067920000,2426.92000000,2427.71000000,2426.48000000,2426.54000000,32.48340000,1728067979999,78834.43388400,1494,19.22220000,46650.45893000,0],
[1728067980000,2426.55000000,2426.63000000,2426.00000000,2426.32000000,34.65370000,1728068039999,84082.68877100,1081,11.39350000,27643.77708100,0],
[1728068040000,2426.32000000,2429.01000000,2426.32000000,2428.32000000,630.03100000,1728068099999,1530049.15995400,1534,495.27340000,1202750.37959400,0],
[1728068100000,2428.31000000,2428.31000000,2426.70000000,2426.70000000,50.35170000,1728068159999,122212.68212500,914,27.53620000,66836.78447300,0],
[1728068160000,2426.70000000,2427.24000000,2426.20000000,2427.22000000,61.27740000,1728068219999,148686.89443100,919,45.80470000,111137.60793100,0],
[1728068220000,2427.22000000,2430.99000000,2427.08000000,2429.51000000,98.46630000,1728068279999,239196.69819900,2598,73.72490000,179076.96258100,0],
[1728068280000,2429.50000000,2430.72000000,2429.14000000,2430.72000000,124.31270000,1728068339999,302052.78229500,2207,59.85860000,145442.59898500,0],
[1728068340000,2430.73000000,2432.46000000,2430.20000000,2432.20000000,131.29360000,1728068399999,319210.85994700,1216,114.24530000,277764.00521400,0],
[1728068400000,2432.19000000,2434.00000000,2431.01000000,2433.34000000,218.67430000,1728068459999,532058.98895800,3127,164.83470000,401067.22158900,0],
[1728068460000,2433.34000000,2434.00000000,2432.03000000,2433.99000000,172.87300000,1728068519999,420568.22215200,2244,103.27860000,251262.49034700,0],
[1728068520000,2433.99000000,2435.00000000,2432.80000000,2435.00000000,120.17920000,1728068579999,292506.08357900,2467,90.42450000,220084.15596300,0],
[1728068580000,2435.00000000,2436.10000000,2430.41000000,2430.41000000,233.09800000,1728068639999,567431.57509400,4167,96.73810000,235524.78306800,0],
[1728068640000,2430.40000000,2430.92000000,2428.40000000,2429.29000000,92.09620000,1728068699999,223754.88728000,2729,29.14760000,70808.60640200,0],
[1728068700000,2429.30000000,2430.59000000,2428.82000000,2429.23000000,97.16700000,1728068759999,236093.41459800,2578,63.44670000,154163.20252700,0],
[1728068760000,2429.22000000,2430.64000000,2428.95000000,2430.22000000,122.36450000,1728068819999,297317.07811400,2225,72.38850000,175886.29512400,0],
[1728068820000,2430.22000000,2430.22000000,2428.67000000,2428.68000000,150.02210000,1728068879999,364499.88851300,1905,25.62310000,62248.74175100,0],
[1728068880000,2428.68000000,2429.39000000,2427.60000000,2428.48000000,78.29520000,1728068939999,190132.41241900,1995,38.90300000,94479.90695300,0],
[1728068940000,2428.49000000,2429.72000000,2428.49000000,2428.89000000,42.08480000,1728068999999,102219.87121700,1751,25.58600000,62145.11055400,0],
[1728069000000,2428.90000000,2429.37000000,2428.86000000,2429.11000000,120.51140000,1728069059999,292733.31902000,1314,27.95190000,67898.08567800,0],
[1728069060000,2429.12000000,2429.12000000,2428.50000000,2428.50000000,38.57390000,1728069119999,93695.04797500,971,14.27990000,34686.26311200,0],
[1728069120000,2428.50000000,2429.73000000,2427.92000000,2429.68000000,65.25830000,1728069179999,158512.50545400,2887,52.97980000,128686.66703200,0],
[1728069180000,2429.67000000,2430.63000000,2429.67000000,2430.62000000,81.92600000,1728069239999,199075.85204200,744,71.38150000,173453.57929000,0],
[1728069240000,2430.63000000,2431.39000000,2430.62000000,2431.38000000,87.19000000,1728069299999,211953.72079500,687,78.79890000,191555.52851800,0],
[1728069300000,2431.38000000,2431.50000000,2431.02000000,2431.50000000,135.92970000,1728069359999,330476.02707100,539,72.93910000,177331.21849300,0],
[1728069360000,2431.50000000,2431.50000000,2430.83000000,2431.20000000,84.03410000,1728069419999,204292.88198000,888,44.68290000,108620.16753200,0],
[1728069420000,2431.21000000,2431.30000000,2430.00000000,2430.01000000,112.93910000,1728069479999,274533.04416200,1580,74.74830000,181705.55316100,0],
[1728069480000,2430.01000000,2430.83000000,2430.01000000,2430.72000000,46.73440000,1728069539999,113587.16814400,1203,25.41970000,61781.24987400,0],
[1728069540000,2430.72000000,2431.56000000,2430.72000000,2431.55000000,84.15830000,1728069599999,204600.46939900,781,59.84790000,145499.88693900,0],
[1728069600000,2431.55000000,2431.55000000,2430.20000000,2431.08000000,116.08950000,1728069659999,282188.64838300,1762,69.87790000,169854.71692600,0],
[1728069660000,2431.07000000,2431.74000000,2431.07000000,2431.62000000,54.19340000,1728069719999,131769.43672100,462,37.01340000,89994.88445000,0],
[1728069720000,2431.62000000,2432.56000000,2431.61000000,2432.41000000,70.19420000,1728069779999,170710.02101200,752,39.06190000,95003.99945400,0],
[1728069780000,2432.40000000,2432.40000000,2429.94000000,2431.01000000,191.98840000,1728069839999,466727.41734500,2662,109.65410000,266539.36930000,0],
[1728069840000,2431.00000000,2432.29000000,2430.85000000,2430.91000000,313.81430000,1728069899999,763043.09626000,1630,208.90680000,507908.91254100,0],
[1728069900000,2430.91000000,2431.26000000,2428.80000000,2428.80000000,72.73350000,1728069959999,176774.71755900,1933,26.39850000,64171.81411100,0],
[1728069960000,2428.75000000,2429.38000000,2428.39000000,2429.00000000,170.10940000,1728070019999,413160.27825300,1131,120.84970000,293509.44283300,0],
[1728070020000,2429.01000000,2429.70000000,2428.00000000,2428.00000000,109.52010000,1728070079999,266023.05386000,2205,41.29010000,100291.47756100,0],
[1728070080000,2428.01000000,2430.73000000,2428.00000000,2430.24000000,151.24450000,1728070139999,367475.87111800,1729,110.18460000,267703.12937300,0],
[1728070140000,2430.23000000,2432.74000000,2430.23000000,2431.03000000,185.66230000,1728070199999,451502.62997000,1702,83.50230000,203035.77756000,0],
[1728070200000,2431.03000000,2431.40000000,2429.84000000,2429.84000000,87.03700000,1728070259999,211567.78298900,2141,19.91690000,48415.86116700,0],
[1728070260000,2429.84000000,2430.59000000,2428.90000000,2429.65000000,103.04460000,1728070319999,250354.75514900,1678,44.71860000,108641.42168400,0],
[1728070320000,2429.65000000,2431.61000000,2429.64000000,2431.33000000,132.47190000,1728070379999,322008.60448100,1895,76.19790000,185193.82903900,0],
[1728070380000,2431.32000000,2431.40000000,2430.20000000,2430.40000000,118.42770000,1728070439999,287869.68486700,1860,46.38350000,112737.67797600,0],
[1728070440000,2430.41000000,2430.72000000,2430.00000000,2430.21000000,59.80800000,1728070499999,145348.12875800,753,22.61380000,54958.44222500,0],
[1728070500000,2430.22000000,2430.22000000,2426.71000000,2429.20000000,173.57490000,1728070559999,421493.46536100,2302,82.92100000,201343.94010200,0],
[1728070560000,2429.20000000,2429.20000000,2427.70000000,2428.75000000,135.52160000,1728070619999,329112.54583300,1272,23.39120000,56798.89320700,0],
[1728070620000,2428.75000000,2429.73000000,2428.28000000,2428.28000000,129.49620000,1728070679999,314561.55749600,1038,37.91230000,92086.06647300,0],
[1728070680000,2428.26000000,2428.26000000,2427.36000000,2427.36000000,53.95690000,1728070739999,130995.13384700,971,6.00480000,14578.75598000,0],
[1728070740000,2427.37000000,2428.00000000,2426.63000000,2426.64000000,56.32280000,1728070799999,136709.12799500,1108,14.43550000,35039.02472400,0],
[1728070800000,2426.63000000,2428.18000000,2426.50000000,2427.04000000,110.65270000,1728070859999,268569.86742400,1992,38.08790000,92447.65636200,0],
[1728070860000,2427.04000000,2427.54000000,2426.16000000,2427.10000000,216.23670000,1728070919999,524733.49748600,1275,62.56870000,151833.66152100,0],
[1728070920000,2427.11000000,2427.11000000,2426.22000000,2426.32000000,37.96400000,1728070979999,92120.73282600,688,2.74930000,6671.30105600,0],
[1728070980000,2426.32000000,2426.33000000,2424.63000000,2425.06000000,69.05970000,1728071039999,167485.58952000,1363,21.88070000,53060.76944800,0],
[1728071040000,2425.05000000,2425.65000000,2423.60000000,2424.05000000,222.68570000,1728071099999,539898.98301700,2193,52.33100000,126872.69660800,0],
[1728071100000,2424.05000000,2425.66000000,2424.05000000,2425.66000000,53.81910000,1728071159999,130503.01777100,622,25.90460000,62815.38269200,0],
[1728071160000,2425.67000000,2426.17000000,2425.20000000,2426.17000000,63.62570000,1728071219999,154326.59325600,783,25.15320000,61014.72556500,0],
[1728071220000,2426.16000000,2426.43000000,2425.70000000,2425.89000000,51.91310000,1728071279999,125942.78361900,796,11.65240000,28269.83101600,0],
[1728071280000,2425.89000000,2427.00000000,2425.88000000,2426.59000000,64.48420000,1728071339999,156461.23170200,1102,31.14600000,75565.88884800,0],
[1728071340000,2426.59000000,2427.00000000,2425.68000000,2427.00000000,87.63730000,1728071399999,212623.15085700,896,36.56160000,88708.29608400,0],
[1728071400000,2426.99000000,2427.20000000,2426.00000000,2426.18000000,65.07600000,1728071459999,157921.41869400,1325,9.15750000,22222.74216500,0],
[1728071460000,2426.19000000,2426.19000000,2425.20000000,2425.51000000,79.14150000,1728071519999,191991.96640900,917,10.03940000,24352.29541100,0],
[1728071520000,2425.52000000,2426.40000000,2425.32000000,2425.33000000,42.15050000,1728071579999,102252.71838200,720,11.26880000,27336.71199600,0],
[1728071580000,2425.32000000,2425.42000000,2424.78000000,2425.33000000,109.54900000,1728071639999,265670.84455800,815,66.74130000,161852.20387400,0],
[1728071640000,2425.33000000,2427.14000000,2425.33000000,2427.13000000,59.97240000,1728071699999,145503.67480900,534,32.71440000,79367.48566600,0],
[1728071700000,2427.13000000,2427.44000000,2425.60000000,2425.94000000,76.93180000,1728071759999,186694.49678400,2098,21.77270000,52843.36198700,0],
[1728071760000,2425.94000000,2426.38000000,2424.89000000,2425.79000000,113.95680000,1728071819999,276422.96422100,1011,10.10470000,24509.67615500,0],
[1728071820000,2425.80000000,2427.54000000,2425.79000000,2427.54000000,62.62170000,1728071879999,151977.02211700,386,31.17580000,75649.97485200,0],
[1728071880000,2427.54000000,2429.40000000,2427.54000000,2429.39000000,148.82400000,1728071939999,361378.29874400,856,117.03210000,284180.97188100,0],
[1728071940000,2429.40000000,2431.60000000,2428.40000000,2428.90000000,297.83260000,1728071999999,723755.86032400,2758,171.44420000,416614.57492500,0],
[1728072000000,2428.90000000,2429.73000000,2427.70000000,2427.70000000,54.49580000,1728072059999,132364.41218100,1949,10.74120000,26088.43034200,0],
[1728072060000,2427.71000000,2427.71000000,2425.74000000,2426.78000000,76.26640000,1728072119999,185073.09083600,988,39.67650000,96271.40021700,0],
[1728072120000,2426.78000000,2428.83000000,2426.77000000,2428.82000000,209.00300000,1728072179999,507378.49403800,1130,167.81030000,407383.14428700,0],
[1728072180000,2428.83000000,2430.72000000,2428.83000000,2430.45000000,162.52170000,1728072239999,394853.11084600,1050,111.13770000,270027.98503800,0],
[1728072240000,2430.45000000,2430.73000000,2428.01000000,2428.01000000,82.23610000,1728072299999,199791.22703100,1819,8.72620000,21198.87064200,0],
[1728072300000,2428.02000000,2428.70000000,2427.35000000,2427.36000000,80.09120000,1728072359999,194464.29013800,806,30.33570000,73656.96814600,0],
[1728072360000,2427.35000000,2427.62000000,2427.35000000,2427.62000000,30.49420000,1728072419999,74026.99142300,376,5.52310000,13407.58005400,0],
[1728072420000,2427.61000000,2428.89000000,2427.45000000,2427.45000000,67.55830000,1728072479999,164051.84837700,1163,19.12190000,46431.72784000,0],
[1728072480000,2427.45000000,2427.90000000,2427.45000000,2427.73000000,61.85440000,1728072539999,150165.68366700,396,38.44000000,93320.72151100,0],
[1728072540000,2427.72000000,2428.87000000,2427.72000000,2427.94000000,61.35270000,1728072599999,148974.27575300,837,26.71210000,64861.42841800,0],
[1728072600000,2427.95000000,2428.37000000,2427.07000000,2427.08000000,62.53550000,1728072659999,151826.03103500,690,15.86620000,38519.71053500,0],
[1728072660000,2427.07000000,2427.07000000,2425.42000000,2425.85000000,172.08290000,1728072719999,417530.13472000,981,91.39710000,221747.80615300,0],
[1728072720000,2425.86000000,2426.70000000,2425.60000000,2426.69000000,127.62810000,1728072779999,309611.59444600,441,83.80330000,203297.63130700,0],
[1728072780000,2426.69000000,2427.60000000,2426.23000000,2427.46000000,130.81150000,1728072839999,317457.78037200,1836,85.55930000,207628.44103500,0],
[1728072840000,2427.47000000,2428.21000000,2427.00000000,2427.96000000,99.48750000,1728072899999,241514.75788400,1262,50.26010000,122009.53850000,0],
[1728072900000,2427.96000000,2428.70000000,2427.70000000,2428.50000000,67.18990000,1728072959999,163146.36325600,1148,31.52420000,76552.66429500,0],
[1728072960000,2428.50000000,2428.51000000,2427.06000000,2427.17000000,59.22120000,1728073019999,143756.04388500,913,26.33580000,63924.10790900,0],
[1728073020000,2427.17000000,2427.17000000,2425.64000000,2425.65000000,105.69120000,1728073079999,256428.68308000,991,40.79850000,98970.83037800,0],
[1728073080000,2425.65000000,2425.81000000,2424.96000000,2425.07000000,295.51000000,1728073139999,716706.18646400,676,24.02070000,58261.98872700,0],
[1728073140000,2425.07000000,2425.07000000,2423.82000000,2424.48000000,62.36100000,1728073199999,151201.85173300,1392,11.84060000,28707.55471600,0],
[1728073200000,2424.47000000,2425.24000000,2422.24000000,2423.99000000,177.54740000,1728073259999,430326.17740600,2345,51.87860000,125752.74740200,0],
[1728073260000,2424.00000000,2424.92000000,2423.99000000,2424.63000000,77.83670000,1728073319999,188719.99336900,639,29.98310000,72693.77728500,0],
[1728073320000,2424.64000000,2426.01000000,2424.64000000,2426.01000000,90.76050000,1728073379999,220110.50537300,277,72.86320000,176707.36321500,0],
[1728073380000,2426.00000000,2427.05000000,2426.00000000,2426.61000000,63.86220000,1728073439999,154962.57306400,843,21.39460000,51911.48665300,0],
[1728073440000,2426.60000000,2426.60000000,2424.31000000,2424.31000000,49.73230000,1728073499999,120637.55495200,869,7.00710000,16994.58869500,0],
[1728073500000,2424.32000000,2425.00000000,2424.01000000,2425.00000000,62.57450000,1728073559999,151703.55308600,452,15.95040000,38669.23031300,0],
[1728073560000,2424.99000000,2425.05000000,2424.69000000,2425.04000000,39.53300000,1728073619999,95861.88051000,384,5.32670000,12916.35030700,0],
[1728073620000,2425.05000000,2425.30000000,2424.89000000,2425.30000000,24.02950000,1728073679999,58274.35459300,282,8.90280000,21590.84866600,0],
[1728073680000,2425.30000000,2425.30000000,2424.98000000,2424.99000000,37.30620000,1728073739999,90470.98321200,296,1.71760000,4165.25896100,0],
[1728073740000,2424.98000000,2425.70000000,2424.96000000,2425.69000000,54.15650000,1728073799999,131348.62661200,359,31.60940000,76661.26018700,0],
[1728073800000,2425.68000000,2425.69000000,2424.78000000,2425.04000000,83.32930000,1728073859999,202093.98776100,1230,25.72190000,62378.33616100,0],
[1728073860000,2425.03000000,2425.04000000,2421.87000000,2423.58000000,303.33010000,1728073919999,734932.55925200,2038,77.71810000,188255.48505300,0],
[1728073920000,2423.59000000,2424.37000000,2423.58000000,2423.80000000,78.34460000,1728073979999,189909.47127700,438,27.08690000,65651.62037900,0],
[1728073980000,2423.80000000,2423.81000000,2422.21000000,2422.58000000,42.42910000,1728074039999,102812.99075300,1199,5.62440000,13626.55464700,0],
[1728074040000,2422.59000000,2422.95000000,2422.28000000,2422.89000000,48.52460000,1728074099999,117558.29247900,866,25.21230000,61081.53204600,0],
[1728074100000,2422.90000000,2424.20000000,2422.65000000,2422.68000000,108.14590000,1728074159999,262068.64396800,1596,47.21050000,114397.06146000,0],
[1728074160000,2422.68000000,2424.70000000,2422.68000000,2424.70000000,50.61190000,1728074219999,122665.71561200,699,43.42350000,105244.97140500,0],
[1728074220000,2424.69000000,2425.11000000,2424.69000000,2425.11000000,23.68970000,1728074279999,57445.12260900,171,19.52360000,47341.91729200,0],
[1728074280000,2425.11000000,2427.54000000,2425.10000000,2426.81000000,69.95870000,1728074339999,169741.51597800,1017,39.74270000,96426.15208000,0],
[1728074340000,2426.82000000,2426.90000000,2426.00000000,2426.89000000,37.22010000,1728074399999,90313.35035900,1093,25.00570000,60675.49147500,0],
[1728074400000,2426.89000000,2428.15000000,2426.60000000,2427.93000000,38.72710000,1728074459999,94008.63732700,664,25.26320000,61327.81876400,0],
[1728074460000,2427.93000000,2429.65000000,2427.93000000,2428.51000000,89.84070000,1728074519999,218220.07670500,1203,50.96290000,123779.29662300,0],
[1728074520000,2428.52000000,2428.80000000,2427.46000000,2427.46000000,27.03530000,1728074579999,65648.73977200,1234,7.51240000,18243.85768700,0],
[1728074580000,2427.45000000,2427.46000000,2426.70000000,2426.88000000,7.14210000,1728074639999,17333.53284000,232,4.44090000,10777.86618300,0],
[1728074640000,2426.88000000,2427.90000000,2426.87000000,2427.90000000,14.45540000,1728074699999,35086.87537400,402,10.95140000,26581.53008900,0],
[1728074700000,2427.89000000,2427.90000000,2427.32000000,2427.32000000,32.71560000,1728074759999,79414.27422900,453,3.41050000,8279.13463200,0],
[1728074760000,2427.33000000,2427.90000000,2426.97000000,2427.74000000,119.67560000,1728074819999,290490.53692600,1267,92.80440000,225260.15198800,0],
[1728074820000,2427.74000000,2430.01000000,2427.44000000,2429.02000000,59.96450000,1728074879999,145637.94654200,2032,45.25700000,109912.07366300,0],
[1728074880000,2429.02000000,2430.00000000,2428.36000000,2429.81000000,36.08980000,1728074939999,87666.03464500,1946,26.51860000,64419.13017500,0],
[1728074940000,2429.81000000,2430.46000000,2429.73000000,2430.46000000,25.41210000,1728074999999,61748.72492700,586,24.83800000,60353.53468500,0],
[1728075000000,2430.47000000,2430.73000000,2430.20000000,2430.40000000,43.55640000,1728075059999,105861.77191100,1053,24.57700000,59733.34608400,0],
[1728075060000,2430.34000000,2431.28000000,2430.33000000,2430.45000000,44.21790000,1728075119999,107477.49109200,592,36.89020000,89665.61836500,0],
[1728075120000,2430.44000000,2430.45000000,2430.21000000,2430.44000000,36.16990000,1728075179999,87907.34450000,384,18.36820000,44641.77512000,0],
[1728075180000,2430.43000000,2430.44000000,2430.23000000,2430.24000000,29.34330000,1728075239999,71315.52343800,271,18.66440000,45361.55793300,0],
[1728075240000,2430.23000000,2430.80000000,2430.23000000,2430.52000000,40.06410000,1728075299999,97373.42777200,591,33.49050000,81395.48550600,0],
[1728075300000,2430.53000000,2431.74000000,2430.39000000,2430.98000000,101.32840000,1728075359999,246335.04208300,1967,54.05360000,131409.83154100,0],
[1728075360000,2430.97000000,2430.97000000,2428.94000000,2429.90000000,143.03220000,1728075419999,347511.06051000,1170,118.03860000,286772.85370500,0],
[1728075420000,2429.90000000,2430.00000000,2429.75000000,2430.00000000,8.81540000,1728075479999,21420.73769800,299,4.77940000,11613.55033100,0],
[1728075480000,2430.00000000,2431.50000000,2429.99000000,2431.23000000,108.56150000,1728075539999,263917.71292300,990,55.06060000,133837.49429400,0],
[1728075540000,2431.22000000,2431.22000000,2429.30000000,2429.30000000,60.37840000,1728075599999,146746.59080200,1203,6.41020000,15578.29668300,0],
[1728075600000,2429.29000000,2430.20000000,2429.29000000,2430.20000000,60.48840000,1728075659999,146965.50234100,674,50.80110000,123429.78781400,0],
[1728075660000,2430.20000000,2431.22000000,2430.19000000,2431.21000000,62.61150000,1728075719999,152177.40124300,654,56.92240000,138349.01436000,0],
[1728075720000,2431.22000000,2431.22000000,2429.89000000,2430.23000000,35.98700000,1728075779999,87480.68098200,1180,10.32270000,25092.31112500,0],
[1728075780000,2430.23000000,2431.00000000,2428.40000000,2428.40000000,105.62610000,1728075839999,256589.91775500,2231,75.74790000,184006.79937000,0],
[1728075840000,2428.40000000,2428.40000000,2427.73000000,2428.14000000,54.89870000,1728075899999,133290.43076400,883,19.35390000,46990.13630900,0],
[1728075900000,2428.13000000,2428.32000000,2426.89000000,2426.89000000,68.89390000,1728075959999,167268.79882600,784,61.09700000,148340.09301900,0],
[1728075960000,2426.90000000,2426.90000000,2426.21000000,2426.78000000,35.64660000,1728076019999,86501.93936900,678,8.61660000,20907.64752300,0],
[1728076020000,2426.79000000,2427.51000000,2426.78000000,2427.51000000,20.38990000,1728076079999,49483.68386400,343,13.90820000,33753.56430500,0],
[1728076080000,2427.51000000,2429.29000000,2427.51000000,2429.28000000,21.94590000,1728076139999,53301.98988700,967,14.50330000,35223.17057900,0],
[1728076140000,2429.28000000,2429.73000000,2429.10000000,2429.20000000,21.14360000,1728076199999,51365.46642500,643,7.97570000,19375.86036300,0],
[1728076200000,2429.21000000,2429.21000000,2428.53000000,2428.53000000,51.89020000,1728076259999,126038.08375300,399,17.85060000,43359.44327300,0],
[1728076260000,2428.53000000,2429.40000000,2428.53000000,2428.71000000,52.38500000,1728076319999,127247.42973400,1033,20.91200000,50794.68174600,0],
[1728076320000,2428.71000000,2429.00000000,2428.53000000,2429.00000000,14.23110000,1728076379999,34564.05050100,526,11.73120000,28492.70710700,0],
[1728076380000,2428.99000000,2429.39000000,2428.89000000,2428.89000000,37.47410000,1728076439999,91029.79015400,603,17.74290000,43099.36743000,0],
[1728076440000,2428.89000000,2428.90000000,2427.17000000,2427.17000000,55.63820000,1728076499999,135097.12812300,719,20.31340000,49320.74307800,0],
[1728076500000,2427.15000000,2428.18000000,2427.14000000,2427.97000000,28.24050000,1728076559999,68556.04328700,826,17.92040000,43501.27239800,0],
[1728076560000,2427.96000000,2428.17000000,2427.21000000,2428.16000000,25.13570000,1728076619999,61018.91485700,660,17.43000000,42312.73260700,0],
[1728076620000,2428.17000000,2429.06000000,2427.98000000,2428.49000000,389.23150000,1728076679999,945251.70755100,1509,152.53600000,370398.79066000,0],
[1728076680000,2428.50000000,2428.51000000,2428.22000000,2428.50000000,11.18810000,1728076739999,27168.46124000,367,7.72280000,18753.44014600,0],
[1728076740000,2428.50000000,2429.00000000,2428.50000000,2428.71000000,48.51360000,1728076799999,117835.06891300,404,14.34480000,34839.82864400,0],
[1728076800000,2428.72000000,2429.27000000,2428.71000000,2429.26000000,14.50210000,1728076859999,35226.71649800,365,13.51500000,32828.82316800,0],
[1728076860000,2429.27000000,2429.27000000,2429.26000000,2429.26000000,6.63100000,1728076919999,16108.45261200,51,2.95520000,7178.97870400,0],
[1728076920000,2429.26000000,2429.27000000,2429.26000000,2429.26000000,8.27450000,1728076979999,20100.93488000,65,2.30100000,5589.75027000,0],
[1728076980000,2429.26000000,2429.27000000,2428.57000000,2428.57000000,18.09420000,1728077039999,43947.03197000,527,5.42970000,13187.17918500,0],
[1728077040000,2428.57000000,2428.57000000,2428.02000000,2428.41000000,31.21830000,1728077099999,75802.95335100,695,20.31910000,49336.81713600,0],
[1728077100000,2428.42000000,2428.58000000,2428.19000000,2428.50000000,92.66120000,1728077159999,225020.89080600,392,23.90200000,58043.54228900,0],
[1728077160000,2428.50000000,2428.50000000,2428.49000000,2428.50000000,5.99410000,1728077219999,14556.66309500,55,5.11860000,12430.52010000,0],
[1728077220000,2428.49000000,2428.50000000,2428.33000000,2428.33000000,24.74640000,1728077279999,60095.08085200,84,3.73470000,9069.16136600,0],
[1728077280000,2428.34000000,2428.34000000,2427.96000000,2427.97000000,13.61790000,1728077339999,33068.23427200,177,2.01550000,4894.11680700,0],
[1728077340000,2427.97000000,2427.97000000,2426.10000000,2426.11000000,73.88960000,1728077399999,179347.47477300,575,29.86820000,72489.51670800,0],
[1728077400000,2426.10000000,2426.10000000,2424.33000000,2425.20000000,98.40480000,1728077459999,238632.70081800,671,30.94840000,75048.43146300,0],
[1728077460000,2425.19000000,2425.50000000,2424.69000000,2425.49000000,78.28000000,1728077519999,189832.27256600,742,17.82960000,43234.26623400,0],
[1728077520000,2425.50000000,2425.50000000,2425.49000000,2425.50000000,19.26680000,1728077579999,46731.50656300,128,7.58310000,18392.80905000,0],
[1728077580000,2425.50000000,2425.60000000,2425.49000000,2425.59000000,22.97080000,1728077639999,55715.67290100,183,16.95720000,41129.69828700,0],
[1728077640000,2425.59000000,2425.60000000,2425.00000000,2425.01000000,51.49880000,1728077699999,124906.30984500,324,25.23830000,61214.83142400,0],
[1728077700000,2425.01000000,2425.01000000,2423.40000000,2424.50000000,35.20750000,1728077759999,85347.07883400,1039,18.23060000,44191.70040700,0],
[1728077760000,2424.50000000,2424.50000000,2423.64000000,2424.15000000,58.87330000,1728077819999,142704.13057500,627,30.15910000,73101.09659700,0],
[1728077820000,2424.15000000,2424.63000000,2423.87000000,2423.87000000,49.17100000,1728077879999,119210.75596300,984,9.65270000,23399.34031100,0],
[1728077880000,2423.87000000,2424.57000000,2423.87000000,2424.33000000,65.99140000,1728077939999,159963.35472400,759,22.23610000,53902.92068300,0],
[1728077940000,2424.33000000,2425.11000000,2424.33000000,2424.85000000,44.44340000,1728077999999,107763.88136800,393,30.85530000,74815.21798600,0],
[1728078000000,2424.85000000,2424.85000000,2424.21000000,2424.69000000,22.30030000,1728078059999,54070.18443900,609,6.57350000,15938.03268600,0],
[1728078060000,2424.70000000,2424.98000000,2424.70000000,2424.98000000,39.83890000,1728078119999,96606.22010600,172,24.57640000,59595.11548100,0],
[1728078120000,2424.98000000,2425.56000000,2424.83000000,2424.84000000,37.87220000,1728078179999,91846.64844300,548,22.68520000,55014.42850200,0],
[1728078180000,2424.83000000,2424.84000000,2424.83000000,2424.83000000,24.57530000,1728078239999,59591.02116600,124,9.64670000,23391.70402800,0],
[1728078240000,2424.84000000,2424.84000000,2424.45000000,2424.46000000,12.16780000,1728078299999,29502.73910600,166,4.18430000,10145.58944600,0],
[1728078300000,2424.46000000,2424.53000000,2422.68000000,2423.28000000,204.66530000,1728078359999,496109.74909200,720,57.31950000,138949.44295700,0],
[1728078360000,2423.27000000,2423.28000000,2423.27000000,2423.27000000,11.73350000,1728078419999,28433.52538900,93,8.68440000,21044.73283200,0],
[1728078420000,2423.27000000,2424.53000000,2423.27000000,2424.53000000,105.44650000,1728078479999,255559.28985000,1237,57.96070000,140480.78589100,0],
[1728078480000,2424.53000000,2425.70000000,2424.53000000,2425.70000000,65.02720000,1728078539999,157710.02573400,704,55.96570000,135732.15056800,0],
[1728078540000,2425.69000000,2425.76000000,2425.69000000,2425.76000000,15.26180000,1728078599999,37021.13450100,143,11.17040000,27096.43701300,0],
[1728078600000,2425.76000000,2425.76000000,2425.32000000,2425.33000000,40.22320000,1728078659999,97561.77792200,295,13.75480000,33363.01746900,0],
[1728078660000,2425.33000000,2425.33000000,2423.43000000,2423.43000000,25.10360000,1728078719999,60866.27301600,531,2.07970000,5042.68731700,0],
[1728078720000,2423.42000000,2426.06000000,2423.42000000,2425.63000000,128.44590000,1728078779999,311495.13696500,1539,69.21670000,167819.67837800,0],
[1728078780000,2425.63000000,2425.64000000,2425.06000000,2425.13000000,100.70380000,1728078839999,244231.69740400,465,88.39700000,214381.24015100,0],
[1728078840000,2425.12000000,2425.12000000,2424.82000000,2425.10000000,32.40780000,1728078899999,78588.76772600,295,9.86320000,23918.98079200,0],
[1728078900000,2425.09000000,2425.10000000,2425.00000000,2425.01000000,16.28670000,1728078959999,39495.87545900,142,2.20430000,5345.59548200,0],
[1728078960000,2425.01000000,2425.01000000,2424.82000000,2424.82000000,22.84060000,1728079019999,55387.70422400,128,2.03580000,4936.70230200,0],
[1728079020000,2424.82000000,2424.83000000,2424.74000000,2424.74000000,24.74100000,1728079079999,59990.95388400,129,18.09160000,43867.78765200,0],
[1728079080000,2424.74000000,2424.74000000,2424.00000000,2424.01000000,26.37460000,1728079139999,63945.66323800,411,4.58280000,11110.76485000,0],
[1728079140000,2424.00000000,2424.35000000,2424.00000000,2424.35000000,55.54380000,1728079199999,134642.50318400,371,53.20960000,128984.12410400,0],
[1728079200000,2424.34000000,2424.79000000,2424.34000000,2424.78000000,72.33600000,1728079259999,175387.07813800,242,37.14970000,90068.63547000,0],
[1728079260000,2424.79000000,2425.01000000,2424.69000000,2425.00000000,119.10510000,1728079319999,288808.06707800,284,110.39990000,267699.32599200,0],
[1728079320000,2425.00000000,2426.40000000,2425.00000000,2425.70000000,142.46260000,1728079379999,345549.07348700,2252,101.65460000,246556.34119100,0],
[1728079380000,2425.69000000,2426.71000000,2425.60000000,2426.70000000,134.39690000,1728079439999,326082.79761100,1133,61.51560000,149246.74730600,0],
[1728079440000,2426.71000000,2428.35000000,2425.66000000,2425.67000000,64.39150000,1728079499999,156294.09088700,1462,35.41530000,85963.51669600,0],
[1728079500000,2425.67000000,2426.89000000,2425.02000000,2425.41000000,68.70700000,1728079559999,166670.45122300,1404,33.90740000,82247.35567600,0],
[1728079560000,2425.41000000,2425.41000000,2421.20000000,2422.40000000,203.19190000,1728079619999,492329.32926600,1486,66.69900000,161584.07607900,0],
[1728079620000,2422.40000000,2423.31000000,2422.38000000,2422.38000000,43.57970000,1728079679999,105588.28942200,671,9.28240000,22490.14900600,0],
[1728079680000,2422.30000000,2422.69000000,2421.67000000,2422.68000000,145.72360000,1728079739999,352935.05071700,1107,133.59740000,323564.54508100,0],
[1728079740000,2422.68000000,2423.11000000,2422.40000000,2423.11000000,31.13140000,1728079799999,75420.02858700,1135,14.04650000,34029.72541800,0],
[1728079800000,2423.11000000,2423.11000000,2422.02000000,2422.02000000,22.57190000,1728079859999,54686.81604100,732,6.31210000,15292.32224200,0],
[1728079860000,2422.02000000,2423.11000000,2422.02000000,2422.60000000,36.20650000,1728079919999,87707.95918400,708,24.72730000,59897.84096900,0],
[1728079920000,2422.60000000,2422.61000000,2421.80000000,2421.81000000,30.21160000,1728079979999,73182.87667000,156,3.45950000,8379.57050900,0],
[1728079980000,2421.81000000,2421.94000000,2421.10000000,2421.48000000,29.48680000,1728080039999,71397.68348600,593,10.71840000,25953.87911100,0],
[1728080040000,2421.47000000,2422.10000000,2420.44000000,2422.09000000,86.25630000,1728080099999,208855.58095200,1045,29.53480000,71513.61745600,0],
[1728080100000,2422.09000000,2422.10000000,2420.67000000,2420.67000000,53.16950000,1728080159999,128759.40418700,648,4.94580000,11976.28140400,0],
[1728080160000,2420.68000000,2423.30000000,2420.68000000,2422.80000000,37.12270000,1728080219999,89918.69955100,920,29.17090000,70654.80654100,0],
[1728080220000,2422.81000000,2422.81000000,2421.83000000,2421.90000000,34.44280000,1728080279999,83435.83868400,937,10.50370000,25444.62529100,0],
[1728080280000,2421.89000000,2423.69000000,2421.89000000,2423.69000000,41.63870000,1728080339999,100873.57831500,1441,38.24700000,92656.43764300,0],
[1728080340000,2423.69000000,2424.78000000,2423.61000000,2424.73000000,113.01600000,1728080399999,274002.79978500,573,100.38870000,243387.78309900,0],
[1728080400000,2424.73000000,2424.76000000,2423.88000000,2424.40000000,70.45010000,1728080459999,170795.96180100,693,25.03580000,60689.91948000,0],
[1728080460000,2424.40000000,2424.41000000,2421.24000000,2421.24000000,60.93750000,1728080519999,147660.40672600,562,6.09900000,14777.15631800,0],
[1728080520000,2421.24000000,2421.53000000,2420.68000000,2420.82000000,85.18550000,1728080579999,206238.46485600,837,62.60050000,151553.79223500,0],
[1728080580000,2420.83000000,2423.00000000,2420.83000000,2422.99000000,47.95740000,1728080639999,116152.70397700,1103,38.83270000,94050.51166500,0],
[1728080640000,2422.99000000,2423.91000000,2422.68000000,2423.80000000,35.75420000,1728080699999,86640.63419000,513,21.49510000,52089.39088100,0],
[1728080700000,2423.80000000,2423.80000000,2421.67000000,2421.67000000,40.25110000,1728080759999,97496.59921500,694,10.40980000,25210.54206600,0],
[1728080760000,2421.68000000,2422.10000000,2421.67000000,2421.85000000,33.17170000,1728080819999,80335.80799400,340,21.88140000,52992.22633800,0],
[1728080820000,2421.85000000,2422.13000000,2421.67000000,2421.67000000,18.36320000,1728080879999,44474.85899200,191,6.34080000,15357.14861200,0],
[1728080880000,2421.68000000,2422.20000000,2421.67000000,2422.20000000,12.24450000,1728080939999,29653.50819900,288,8.46500000,20500.52524400,0],
[1728080940000,2422.19000000,2422.69000000,2421.84000000,2421.85000000,39.38090000,1728080999999,95384.46803500,262,15.11200000,36605.88126700,0],
[1728081000000,2421.84000000,2421.95000000,2420.72000000,2421.66000000,19.31120000,1728081059999,46761.74101000,932,5.62410000,13618.49105100,0],
[1728081060000,2421.66000000,2422.27000000,2421.33000000,2421.34000000,34.36440000,1728081119999,83228.60810700,578,14.38080000,34826.81644200,0],
[1728081120000,2421.33000000,2421.50000000,2419.00000000,2419.99000000,155.26870000,1728081179999,375740.71583300,967,39.59090000,95802.51668200,0],
[1728081180000,2419.99000000,2421.10000000,2419.99000000,2420.26000000,85.80560000,1728081239999,207710.67959500,669,26.01940000,62972.06440500,0],
[1728081240000,2420.25000000,2420.26000000,2419.67000000,2419.67000000,40.56980000,1728081299999,98181.13287900,371,3.76080000,9101.51199900,0],
[1728081300000,2419.67000000,2419.69000000,2419.30000000,2419.68000000,42.34480000,1728081359999,102456.84137500,478,12.40640000,30017.50735200,0],
[1728081360000,2419.69000000,2419.78000000,2419.40000000,2419.78000000,32.93600000,1728081419999,79693.90280800,323,22.46420000,54355.83020600,0],
[1728081420000,2419.77000000,2419.78000000,2418.30000000,2419.67000000,43.55540000,1728081479999,105363.82704600,1348,15.43350000,37333.68755900,0],
[1728081480000,2419.66000000,2419.66000000,2418.22000000,2418.23000000,30.62250000,1728081539999,74077.01743500,822,7.08340000,17133.47632500,0],
[1728081540000,2418.22000000,2418.90000000,2417.65000000,2417.66000000,83.75460000,1728081599999,202573.56375600,1264,36.35780000,87933.20843900,0],
[1728081600000,2417.65000000,2418.49000000,2417.65000000,2418.48000000,34.01850000,1728081659999,82259.42405800,805,21.15410000,51149.16293700,0],
[1728081660000,2418.49000000,2418.49000000,2417.80000000,2418.42000000,28.61460000,1728081719999,69196.82300800,1082,16.53350000,39980.87354300,0],
[1728081720000,2418.42000000,2419.20000000,2418.41000000,2418.97000000,35.46990000,1728081779999,85795.76386100,732,25.72410000,62220.88854400,0],
[1728081780000,2418.98000000,2418.98000000,2418.77000000,2418.77000000,11.26130000,1728081839999,27240.64310900,146,9.20190000,22259.11859300,0],
[1728081840000,2418.76000000,2418.76000000,2417.80000000,2417.80000000,12.23630000,1728081899999,29591.29192300,311,4.87980000,11801.34710000,0],
[1728081900000,2417.80000000,2418.66000000,2417.38000000,2418.66000000,85.91320000,1728081959999,207723.92415400,1344,37.84000000,91498.31972900,0],
[1728081960000,2418.65000000,2418.66000000,2418.01000000,2418.32000000,20.40240000,1728082019999,49339.24895500,347,7.59900000,18375.45191200,0],
[1728082020000,2418.33000000,2418.66000000,2418.32000000,2418.65000000,9.01360000,1728082079999,21799.34418000,232,7.74170000,18723.15102500,0],
[1728082080000,2418.66000000,2418.66000000,2417.65000000,2417.66000000,58.38410000,1728082139999,141173.70800800,727,26.07710000,63049.09409700,0],
[1728082140000,2417.65000000,2418.29000000,2417.65000000,2418.29000000,25.79980000,1728082199999,62377.09651800,433,14.41560000,34853.85227500,0],
[1728082200000,2418.28000000,2418.32000000,2417.81000000,2418.32000000,23.22020000,1728082259999,56146.02985100,349,10.92450000,26414.97661000,0],
[1728082260000,2418.32000000,2419.05000000,2418.32000000,2419.05000000,44.04280000,1728082319999,106522.11835400,409,40.91710000,98962.14121700,0],
[1728082320000,2419.05000000,2419.05000000,2418.46000000,2419.00000000,15.93370000,1728082379999,38540.53684600,460,6.23090000,15070.59314400,0],
[1728082380000,2418.99000000,2420.17000000,2418.99000000,2420.16000000,41.76920000,1728082439999,101071.35269600,668,30.26610000,73232.89571500,0],
[1728082440000,2420.16000000,2420.17000000,2419.20000000,2419.20000000,29.73230000,1728082499999,71947.23039200,536,12.28740000,29734.38638200,0],
[1728082500000,2419.21000000,2420.00000000,2419.20000000,2420.00000000,15.76470000,1728082559999,38144.34799500,611,10.21220000,24709.27855100,0],
[1728082560000,2419.99000000,2420.68000000,2419.99000000,2420.22000000,7.93630000,1728082619999,19208.20468500,581,4.58680000,11100.89287500,0],
[1728082620000,2420.23000000,2421.14000000,2420.22000000,2421.13000000,38.73840000,1728082679999,93769.97257300,402,19.14950000,46351.91487900,0],
[1728082680000,2421.13000000,2421.14000000,2420.67000000,2420.67000000,10.41900000,1728082739999,25224.04669800,217,2.43840000,5903.24360800,0],
[1728082740000,2420.68000000,2420.91000000,2420.67000000,2420.91000000,7.47870000,1728082799999,18104.08211200,268,6.48320000,15694.23856500,0],
[1728082800000,2420.91000000,2421.21000000,2420.90000000,2421.14000000,11.68430000,1728082859999,28287.63472400,418,9.41460000,22792.37359800,0],
[1728082860000,2421.14000000,2421.48000000,2420.09000000,2421.48000000,46.33040000,1728082919999,112162.17065800,1433,18.44500000,44653.87786500,0],
[1728082920000,2421.48000000,2421.48000000,2420.75000000,2421.08000000,24.88300000,1728082979999,60244.23584700,349,12.87690000,31175.84981700,0],
[1728082980000,2421.08000000,2421.50000000,2421.08000000,2421.13000000,52.79290000,1728083039999,127831.22981700,455,42.44420000,102773.57513800,0],
[1728083040000,2421.14000000,2421.14000000,2420.00000000,2420.00000000,34.48440000,1728083099999,83474.03505600,163,8.91830000,21590.04802300,0],
[1728083100000,2420.00000000,2420.00000000,2417.82000000,2418.23000000,191.40100000,1728083159999,462955.18904300,567,75.88690000,183536.23852100,0],
[1728083160000,2418.22000000,2419.20000000,2417.75000000,2418.16000000,96.36340000,1728083219999,233054.97446600,1563,60.26140000,145730.71013400,0],
[1728083220000,2418.16000000,2418.16000000,2413.84000000,2415.34000000,269.72130000,1728083279999,651550.51467100,2131,79.75950000,192597.85040200,0],
[1728083280000,2415.35000000,2416.33000000,2415.34000000,2416.20000000,36.46700000,1728083339999,88098.16272100,1107,20.07100000,48487.88951100,0],
[1728083340000,2416.20000000,2416.59000000,2416.20000000,2416.58000000,26.34460000,1728083399999,63655.88879800,376,22.25370000,53771.22297400,0],
[1728083400000,2416.59000000,2418.93000000,2416.59000000,2418.70000000,88.02140000,1728083459999,212816.06488600,2251,73.45580000,177593.97984600,0],
[1728083460000,2418.70000000,2418.71000000,2417.78000000,2418.16000000,60.88500000,1728083519999,147233.23369100,535,28.67510000,69337.81551800,0],
[1728083520000,2418.15000000,2418.27000000,2418.15000000,2418.26000000,36.97180000,1728083579999,89404.02842300,162,27.49350000,66484.07255900,0],
[1728083580000,2418.27000000,2418.70000000,2418.26000000,2418.69000000,17.38480000,1728083639999,42044.37111500,249,15.61990000,37775.94258600,0],
[1728083640000,2418.69000000,2418.70000000,2417.80000000,2417.81000000,51.52090000,1728083699999,124603.85993500,751,15.31230000,37034.30312800,0],
[1728083700000,2417.80000000,2418.93000000,2417.49000000,2418.43000000,148.11440000,1728083759999,358194.35140500,1096,114.05360000,275822.11482600,0],
[1728083760000,2418.42000000,2418.43000000,2417.29000000,2417.66000000,46.37810000,1728083819999,112135.33150600,844,19.26910000,46586.73299200,0],
[1728083820000,2417.65000000,2417.65000000,2416.64000000,2416.98000000,29.18090000,1728083879999,70531.91206200,805,7.82780000,18919.75246600,0],
[1728083880000,2416.99000000,2416.99000000,2415.64000000,2415.64000000,28.22470000,1728083939999,68195.25683700,311,2.60760000,6300.94000600,0],
[1728083940000,2415.64000000,2416.22000000,2415.64000000,2416.21000000,45.36740000,1728083999999,109604.89096600,599,28.63520000,69179.05201900,0],
[1728084000000,2416.21000000,2416.24000000,2415.85000000,2415.85000000,50.00540000,1728084059999,120822.84094300,209,36.05770000,87123.15267900,0],
[1728084060000,2415.86000000,2416.23000000,2415.69000000,2415.69000000,22.24850000,1728084119999,53752.32530500,340,15.80800000,38192.09212000,0],
[1728084120000,2415.69000000,2415.80000000,2414.68000000,2415.12000000,106.54190000,1728084179999,257346.95705900,834,34.39210000,83060.13021100,0],
[1728084180000,2415.12000000,2415.65000000,2414.68000000,2415.29000000,24.50900000,1728084239999,59192.17368000,756,8.77900000,21201.35762900,0],
[1728084240000,2415.29000000,2415.75000000,2415.28000000,2415.74000000,19.93120000,1728084299999,48145.34266900,267,14.80790000,35768.79462300,0],
[1728084300000,2415.75000000,2415.75000000,2414.68000000,2414.69000000,21.09230000,1728084359999,50946.23071200,479,2.27680000,5498.60308500,0],
[1728084360000,2414.68000000,2415.87000000,2414.68000000,2415.57000000,115.16010000,1728084419999,278181.36606900,1249,36.94480000,89233.41652400,0],
[1728084420000,2415.56000000,2415.80000000,2414.68000000,2414.68000000,128.04930000,1728084479999,309301.95345600,541,10.18770000,24609.24577000,0],
[1728084480000,2414.68000000,2414.80000000,2413.91000000,2414.00000000,359.40970000,1728084539999,867709.35654900,1052,53.50780000,129172.07526100,0],
[1728084540000,2413.99000000,2414.00000000,2413.14000000,2413.69000000,171.62640000,1728084599999,414229.42285200,897,24.66980000,59538.43971600,0],
[1728084600000,2413.69000000,2413.70000000,2413.45000000,2413.59000000,86.34150000,1728084659999,208397.15963400,211,16.89980000,40788.74891600,0],
[1728084660000,2413.59000000,2413.60000000,2412.62000000,2413.20000000,137.75030000,1728084719999,332393.74526000,884,67.35030000,162517.46538000,0],
[1728084720000,2413.05000000,2413.48000000,2412.40000000,2412.86000000,93.83990000,1728084779999,226426.07238800,864,12.65980000,30544.82233500,0],
[1728084780000,2412.85000000,2412.86000000,2412.62000000,2412.72000000,15.17980000,1728084839999,36624.88750800,197,5.74410000,13858.88577400,0],
[1728084840000,2412.72000000,2414.64000000,2412.72000000,2414.64000000,99.72430000,1728084899999,240646.25226500,651,55.65060000,134298.55428700,0],
[1728084900000,2414.64000000,2414.64000000,2414.20000000,2414.21000000,20.92560000,1728084959999,50521.41801600,363,9.23090000,22286.30705700,0],
[1728084960000,2414.20000000,2415.29000000,2414.13000000,2414.99000000,41.67130000,1728085019999,100626.21245900,1212,29.64950000,71593.06379500,0],
[1728085020000,2414.99000000,2415.06000000,2414.48000000,2415.06000000,88.69550000,1728085079999,214176.23249700,545,10.02030000,24197.37888000,0],
[1728085080000,2415.06000000,2415.65000000,2414.86000000,2415.64000000,85.75610000,1728085139999,207110.08991200,439,31.08440000,75077.20381400,0],
[1728085140000,2415.65000000,2416.24000000,2415.65000000,2416.20000000,28.92310000,1728085199999,69875.36447500,672,18.92010000,45706.95464200,0],
[1728085200000,2416.20000000,2416.20000000,2415.42000000,2415.42000000,18.78410000,1728085259999,45377.39119700,685,3.04970000,7368.16175100,0],
[1728085260000,2415.42000000,2415.43000000,2414.86000000,2414.86000000,70.76980000,1728085319999,170919.90961100,523,3.97700000,9604.90095800,0],
[1728085320000,2414.86000000,2414.86000000,2414.00000000,2414.00000000,66.63210000,1728085379999,160871.16901200,517,7.89530000,19063.66084400,0],
[1728085380000,2414.01000000,2414.01000000,2413.01000000,2413.42000000,22.13160000,1728085439999,53413.71259800,541,9.29910000,22441.08323700,0],
[1728085440000,2413.42000000,2413.60000000,2413.16000000,2413.59000000,126.09970000,1728085499999,304317.33411900,348,20.64790000,49832.56863300,0],
[1728085500000,2413.60000000,2413.98000000,2413.59000000,2413.97000000,27.44400000,1728085559999,66242.52790000,223,23.97050000,57858.63244900,0],
[1728085560000,2413.98000000,2414.95000000,2413.97000000,2414.94000000,35.31860000,1728085619999,85284.77935000,417,17.66280000,42647.27799100,0],
[1728085620000,2414.95000000,2415.37000000,2414.94000000,2415.23000000,28.04610000,1728085679999,67731.65515500,258,18.35860000,44336.86167000,0],
[1728085680000,2415.23000000,2415.23000000,2413.99000000,2414.00000000,45.92790000,1728085739999,110907.43692700,921,7.51420000,18143.53051800,0],
[1728085740000,2414.00000000,2414.95000000,2413.99000000,2414.36000000,87.52740000,1728085799999,211334.82077800,888,40.89580000,98729.08554600,0],
[1728085800000,2414.36000000,2416.25000000,2414.35000000,2416.24000000,41.25100000,1728085859999,99634.88741400,1298,39.08300000,94398.03547500,0],
[1728085860000,2416.24000000,2416.25000000,2416.24000000,2416.25000000,13.19060000,1728085919999,31871.75232200,58,9.69780000,23432.30925000,0],
[1728085920000,2416.25000000,2416.65000000,2416.24000000,2416.65000000,39.11520000,1728085979999,94518.56974800,517,29.62410000,71584.28992500,0],
[1728085980000,2416.65000000,2419.91000000,2416.65000000,2417.62000000,463.28160000,1728086039999,1120398.83411100,1621,397.33320000,960905.81244400,0],
[1728086040000,2417.61000000,2417.61000000,2416.70000000,2416.73000000,57.30680000,1728086099999,138502.99959600,465,39.91240000,96457.27861600,0],
[1728086100000,2416.73000000,2416.74000000,2415.64000000,2415.65000000,176.60350000,1728086159999,426684.50279900,848,33.89750000,81891.03464700,0],
[1728086160000,2415.65000000,2415.65000000,2414.44000000,2414.44000000,79.40800000,1728086219999,191760.12143200,925,9.07060000,21901.58694300,0],
[1728086220000,2414.44000000,2414.45000000,2414.40000000,2414.41000000,13.78590000,1728086279999,33285.05138400,130,3.30520000,7980.18780400,0],
[1728086280000,2414.41000000,2414.41000000,2414.40000000,2414.40000000,14.03300000,1728086339999,33881.33527300,98,6.00730000,14504.08519300,0],
[1728086340000,2414.41000000,2414.41000000,2414.40000000,2414.41000000,11.37880000,1728086399999,27473.02051200,69,4.57920000,11056.06627200,0]
];
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
    this.px_per_second = -1;
    this.px_per_value = -1;
    this.w = w;
    this.h = h;
    this.data_ref = [];

    let is_canvas = ( document.getElementById( wrapper_id ) instanceof HTMLCanvasElement );

    this.drawbox = is_canvas ? new NKCanvas( this.wrapper_id ) : new NKDrawbox( this.wrapper_id );
}

NKCandleChart.prototype.setSize = function ( w = 600, h = 300 ) {
    this.w = w;
    this.h = h;
}

NKCandleChart.prototype.setScale = function ( px_per_second = 0.1, px_per_value = 0.1 ) {
    this.px_per_second = px_per_second;
    this.px_per_value = px_per_value;
}

NKCandleChart.prototype.setMouseMoveCbk = function ( cbk ) {
    let self = this;

    this.drawbox.onMouseMoveCbk = function (x, y) {
        let minutes = parseInt( x.nkdiv( self.px_per_second ).nkdiv(60) );
        try {
            cbk(x, y, self.data_ref[minutes]);
        } catch (e){}

    }
}

/*
NKCandleChart.prototype.zoomW = function ( x ) {
    this.px_per_second = (this.px_per_second).nksum(x);
}

NKCandleChart.prototype.zoomH = function ( y ) {
    this.px_per_value = (this.px_per_value).nksum(y);
}*/

NKCandleChart.prototype.drawCandles = function ( candle_array ) {
    if ( candle_array.length === 0 ) return;

    this.data_ref = candle_array;

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

    if ( this.px_per_second === -1 ) this.px_per_second = (this.w).nkdiv( max_timestamp.nkminus(min_timestamp) );
    if ( this.px_per_value === -1 ) this.px_per_value = (this.h).nkdiv( max_price.nkminus(min_price) );

    this.h = max_price.nkminus(min_price).nkmul(this.px_per_value);
    this.w = (candle_array.length).nkmul(60).nkmul(this.px_per_second); //60 seg per candle (1min)

    this.drawbox.clean();
    this.drawbox.setSize(this.w, this.h);


    let rw = 1;


    for ( let i = 0; i < candle_array.length; i++ ) {
        let candle = candle_array[i];


        let low = this.h - (candle.low-min_price) * this.px_per_value;
        let high = this.h - (candle.high-min_price) * this.px_per_value;
        let open = this.h - (candle.open-min_price) * this.px_per_value;
        let close = this.h - (candle.close-min_price) * this.px_per_value;


        let x = (candle.timestamp).nkdiv(1000).nkminus(min_timestamp).nkmul(this.px_per_second);

        let y1 = high;
        let y2 = low;

        //Red: #EF5350
        //Green: #26A69A
        let default_color = open < close ? "#EF5350" : "#26A69A";
        let color = candle.color ? candle.color : default_color;

        let w = (50).nkmul(this.px_per_second); //Usar 60 segundos para dibujar cada candle

        //let x_rect = x.nkminus( (35).nkmul(this.px_per_second) )
        let line_x = x.nkadd( (35).nkmul(this.px_per_second) );
        let candle_x = x.nksum( (5).nkmul(this.px_per_second) ); //Como el ancho del candle es 50seg en vez de 60, le sumamos 5seg por lado




        this.drawbox.drawLine({
            x: line_x,
            y: y1,
            x2: line_x,
            y2: y2,
            w: 1,
            color: color,
        });

        this.drawbox.drawRect({
            x: candle_x,
            y: Math.min(open, close),
            w: w,
            h: Math.abs(open-close),
            color: color,
            border_px: 0
        });



    }


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



};var NKClipboard = {};

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

            NKDrag.selection.element.style.transform = `translate(${left}px, ${top}px)`;

            NKDrag.dispatchEvent('onDrag', {
                e: NKDrag.selection.element,
                position: {left: left, top: top}
            });
        }
    }

    NKDom.addEventListener( document, 'mousemove', onMouseMove );

    function onMouseUp( e ) {
        NKDrag.selection.element = null;
    }

    NKDom.addEventListener( document, 'mouseup', onMouseUp );
};

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
}

NKDrawbox.prototype.setSize = function ( w = 400, h = 200 ) {
    this.wrapper.style.width = w + 'px';
    this.wrapper.style.height = h + 'px';
}


NKDrawbox.prototype._drawDiv = function ( args ) {
   // console.log(args);
    const new_div = document.createElement('div');

    if ( NK.isset(args.class) ) new_div.className = args.class;
    new_div.style.position = 'absolute';
    new_div.style.transformOrigin = args.origin ? args.origin : 'top left';

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
        new_div.style.border  =  args.border_px + 'px ' + args.border_style + ' ' + args.border_color;
    }

    if ( args.border_top_px || args.border_top_color || args.border_top_style ) {
        if ( !NK.isset(args.border_top_px) ) args.border_top_px = 1;
        if ( !NK.isset(args.border_top_color) ) args.border_top_color = "black";
        if ( !NK.isset(args.border_top_style) ) args.border_top_style = "solid"; //dotted
        new_div.style.borderTop  =  args.border_top_px + 'px ' + args.border_top_style + ' ' + args.border_top_color;
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

    let props = {
        x: args.x ?? 0,
        y: args.y ?? 0,
        w: args.w ?? 0,
        h: args.h ?? 0,
        border_px: args.border_px ?? 1,
        border_color: args.border_color ?? "black",
    }

    if ( args.x && args.x2 ) props.w = (args.x2).nkminus(args.x);
    if ( args.y && args.y2 ) props.h = (args.y2).nkminus(args.y);

    if ( args.class ) props.class = args.class;
    if ( args.color ) props.color = args.color;
    if ( args.border_style ) props.border_style = args.border_style;

    this._drawDiv( props );
};

NKDrawbox.prototype.drawLine = function( args ) {

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

;let NKVar = {};

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