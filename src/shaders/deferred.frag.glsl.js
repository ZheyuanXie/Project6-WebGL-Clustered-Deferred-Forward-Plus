export default function(params) {
  var numClusters = params.xSlices * params.ySlices * params.zSlices;
  var numComponents = Math.ceil((params.maxNumLights + 1) / 4);
  return `
  #version 100
  precision highp float;
  
  uniform sampler2D u_gbuffers[${params.numGBuffers}];
  uniform sampler2D u_lightbuffer;

  uniform sampler2D u_clusterbuffer;

  uniform float u_cameraNear;
  uniform float u_cameraFar;
  uniform int u_canvasWidth;
  uniform int u_canvasHeight;

  uniform vec3 u_cameraPosition;
  
  varying vec2 v_uv;

  struct Light {
    vec3 position;
    float radius;
    vec3 color;
  };

  float ExtractFloat(sampler2D texture, int textureWidth, int textureHeight, int index, int component) {
    float u = float(index + 1) / float(textureWidth + 1);
    int pixel = component / 4;
    float v = float(pixel + 1) / float(textureHeight + 1);
    vec4 texel = texture2D(texture, vec2(u, v));
    int pixelComponent = component - pixel * 4;
    if (pixelComponent == 0) {
      return texel[0];
    } else if (pixelComponent == 1) {
      return texel[1];
    } else if (pixelComponent == 2) {
      return texel[2];
    } else if (pixelComponent == 3) {
      return texel[3];
    }
  }

  Light UnpackLight(int index) {
    Light light;
    float u = float(index + 1) / float(${params.numLights + 1});
    vec4 v1 = texture2D(u_lightbuffer, vec2(u, 0.0));
    vec4 v2 = texture2D(u_lightbuffer, vec2(u, 0.5));
    light.position = v1.xyz;

    // LOOK: This extracts the 4th float (radius) of the (index)th light in the buffer
    // Note that this is just an example implementation to extract one float.
    // There are more efficient ways if you need adjacent values
    light.radius = ExtractFloat(u_lightbuffer, ${params.numLights}, 2, index, 3);

    light.color = v2.rgb;
    return light;
  }

  // Cubic approximation of gaussian curve so we falloff to exactly 0 at the light radius
  float cubicGaussian(float h) {
    if (h < 1.0) {
      return 0.25 * pow(2.0 - h, 3.0) - pow(1.0 - h, 3.0);
    } else if (h < 2.0) {
      return 0.25 * pow(2.0 - h, 3.0);
    } else {
      return 0.0;
    }
  }
  
  void main() {
    // extract data from g buffers and do lighting
    vec4 gb0 = texture2D(u_gbuffers[0], v_uv);
    vec4 gb1 = texture2D(u_gbuffers[1], v_uv);

    // extract albedo, position, and normal
    vec3 albedo = gb0.xyz;
    vec3 position = gb1.xyz;
    
    /* 2-component normal */
    // decode normal
    vec2 enc = vec2(gb0.w, gb1.w) * 2.0 - 1.0;
    vec4 nn = vec4(enc, 1.0, -1.0);
    float l = dot(nn.xyz, -nn.xyw);
    nn.z = l;
    nn.xy *= sqrt(l);
    vec3 normal = nn.xyz * 2.0 + vec3(0.0, 0.0, -1.0);

    /* 3-component normal */
    // vec4 gb2 = texture2D(u_gbuffers[2], v_uv);
    // vec3 normal = gb2.xyz;

    float xStride, yStride, zStride;
    xStride = float(u_canvasWidth ) / float(${params.xSlices});
    yStride = float(u_canvasHeight) / float(${params.ySlices});
    zStride = (u_cameraFar - u_cameraNear) / float(${params.zSlices});

    int clusterX, clusterY, clusterZ;
    clusterX = int(floor(gl_FragCoord.x / xStride));
    clusterY = int(floor(gl_FragCoord.y / yStride));
    clusterZ = int(floor((gl_FragCoord.z - u_cameraNear) / zStride));
    int clusterIdx = clusterX + clusterY * ${params.xSlices} + clusterZ * ${params.xSlices} * ${params.ySlices};
    int lightCnt = int(ExtractFloat(u_clusterbuffer, ${numClusters}, ${numComponents}, clusterIdx, 0));

    vec3 fragColor = vec3(0.0);

    for (int i = 1; i <= ${params.numLights}; ++i) {
      if (i > lightCnt) {
        break;
      }

      int lightIdx = int(ExtractFloat(u_clusterbuffer, ${numClusters}, ${numComponents}, clusterIdx, i));

      Light light = UnpackLight(lightIdx);
      float lightDistance = distance(light.position, position);
      vec3 L = (light.position - position) / lightDistance;

      float lightIntensity = cubicGaussian(2.0 * lightDistance / light.radius);
      float lambertTerm = max(dot(L, normal), 0.0);

      fragColor += albedo * lambertTerm * light.color * vec3(lightIntensity);

      // Blinn-Phong shading
      if (${params.blinnPhong}) {
        vec3 V = normalize(u_cameraPosition - position);
        vec3 H = normalize(L + V);
        float specularAngle = max(dot(H, normal), 0.0);
        float specularTerm = pow(specularAngle, 100.0);
        fragColor += specularTerm * light.color * vec3(lightIntensity);
      }
    }

    const vec3 ambientLight = vec3(0.025);
    fragColor += albedo * ambientLight;

    gl_FragColor = vec4(fragColor, 1.0);
  }
  `;
}