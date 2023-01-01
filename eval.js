export function indirectEval(script) {
    return eval(`"use strict";${script}`);
}
