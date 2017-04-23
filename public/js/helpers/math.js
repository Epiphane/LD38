define([
], function(
) {
   var MathUtil = {};

   MathUtil.lerp = function(curr, dest, howFar) {
      return curr + (dest - curr) * howFar;
   };

   return MathUtil;
})
