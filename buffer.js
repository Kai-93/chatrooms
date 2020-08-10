/*
 * @Author: Kaiser
 * @Date: 2020-07-16 12:57:48
 * @Last Modified by: Kaiser
 * @Last Modified time: 2020-07-16 12:59:36
 * @Description:
 */

// const str = '\u00bd + \u00bc = \u00be';
const str = '\u00bd +a';

console.log(
  `${str}: ${str.length} characters, ` +
    `${Buffer.byteLength(str, 'utf8')} bytes`
);
