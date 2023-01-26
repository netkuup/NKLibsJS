class NKPromise {

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

}