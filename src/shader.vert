precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

// We always must do at least one thing in the vertex shader:
// tell the pixel where on the screen it lives:

void main() {
  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0);
  
  // Make sure the shader covers the entire screen:
  // scale the rect by two, and move it to the center of the screen
  // if we don't do this, it will appear with its bottom left corner in the center of the sketch
  // try commenting this line out to see what happens
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  gl_Position = positionVec4;
}
