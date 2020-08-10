/*
 * @Author: Kaiser
 * @Date: 2020-07-14 22:03:15
 * @Last Modified by: Kaiser
 * @Last Modified time: 2020-07-14 22:05:34
 * @Description:
 */

function async(cb) {
  debugger;
  setTimeout(cb, 200);
}
var color = 'green';
async(function () {
  debugger;
  console.log(color);
});

color = 'red';
