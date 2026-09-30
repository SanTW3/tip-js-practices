"use strict";
 
function check(n, expr, value) {
  console.log(`${n}. ${expr}`);
  console.log("   Результат:", value);
  console.log("   Тип результата:", typeof value);
}
 

check(1, '"8" + 2', "8" + 2);
 
check(2, '"8" - 2', "8" - 2);
 
check(3, 'Number("8") + 2', Number("8") + 2);
 
check(4, '"12" > "3"', "12" > "3");
 
check(5, '12 === "12"', 12 === "12");
 
check(6, 'Number("")', Number(""));
 
check(7, 'Number("text")', Number("text"));
 
check(8, 'Boolean("false")', Boolean("false"));
 
check(9, "typeof null", typeof null);
 
check(10, "typeof NaN", typeof NaN);
 