/**
 * @fileoverview Rule to enforce spacing around embedded expressions of template strings
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var astUtils = require("../ast-utils");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var OPEN_PAREN = /\$\{$/;
var CLOSE_PAREN = /^\}/;

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {
    var sourceCode = context.getSourceCode();
    var always = context.options[0] === "always";
    var prefix = always ? "Expected" : "Unexpected";

    /**
     * Checks spacing before `}` of a given token.
     * @param {Token} token - A token to check. This is a Template token.
     * @returns {void}
     */
    function checkSpacingBefore(token) {
        var prevToken = sourceCode.getTokenBefore(token);
        if (prevToken &&
            CLOSE_PAREN.test(token.value) &&
            astUtils.isTokenOnSameLine(prevToken, token) &&
            sourceCode.isSpaceBetweenTokens(prevToken, token) !== always
        ) {
            context.report({
                loc: token.loc.start,
                message: prefix + " space(s) before '}'.",
                fix: function(fixer) {
                    if (always) {
                        return fixer.insertTextBefore(token, " ");
                    }
                    return fixer.removeRange([
                        prevToken.range[1],
                        token.range[0]
                    ]);
                }
            });
        }
    }

    /**
     * Checks spacing after `${` of a given token.
     * @param {Token} token - A token to check. This is a Template token.
     * @returns {void}
     */
    function checkSpacingAfter(token) {
        var nextToken = sourceCode.getTokenAfter(token);
        if (nextToken &&
            OPEN_PAREN.test(token.value) &&
            astUtils.isTokenOnSameLine(token, nextToken) &&
            sourceCode.isSpaceBetweenTokens(token, nextToken) !== always
        ) {
            context.report({
                loc: {
                    line: token.loc.end.line,
                    column: token.loc.end.column - 2
                },
                message: prefix + " space(s) after '${'.",
                fix: function(fixer) {
                    if (always) {
                        return fixer.insertTextAfter(token, " ");
                    }
                    return fixer.removeRange([
                        token.range[1],
                        nextToken.range[0]
                    ]);
                }
            });
        }
    }

    return {
        TemplateElement: function(node) {
            var token = sourceCode.getFirstToken(node);
            checkSpacingBefore(token);
            checkSpacingAfter(token);
        }
    };
};

module.exports.schema = [
    {enum: ["always", "never"]}
];
