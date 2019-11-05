#version 100
#extension GL_EXT_draw_buffers: enable
precision highp float;

uniform sampler2D u_colmap;
uniform sampler2D u_normap;

varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

vec3 applyNormalMap(vec3 geomnor, vec3 normap) {
    normap = normap * 2.0 - 1.0;
    vec3 up = normalize(vec3(0.001, 1, 0.001));
    vec3 surftan = normalize(cross(geomnor, up));
    vec3 surfbinor = cross(geomnor, surftan);
    return normalize(normap.y * surftan + normap.x * surfbinor + normap.z * geomnor);
}

void main() {
    vec3 norm = applyNormalMap(v_normal, vec3(texture2D(u_normap, v_uv)));
    vec3 col = vec3(texture2D(u_colmap, v_uv));

    // encode normal
    vec2 enc = normalize(norm.xy) * (sqrt(-norm.z * 0.5 + 0.5));
    enc = enc * 0.5 + 0.5;

    // decode normal for testing
    // vec4 nn = vec4(enc, 1.0, -1.0);
    // float l = dot(nn.xyz, -nn.xyw);
    // nn.z = l;
    // nn.xy *= sqrt(l);
    // vec3 dec = nn.xyz * 2.0 + vec3(0.0, 0.0, -1.0);
    // gl_FragData[2] = vec4(dec, 1.0);
    // gl_FragData[3] = vec4(normalize(norm), 1.0);

    gl_FragData[0] = vec4(col, enc.x);
    gl_FragData[1] = vec4(v_position, enc.y);

}