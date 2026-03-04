// AUTO-GENERATED — do not edit manually.
// Run `npm run precompile` to regenerate from src/templates/.
// @ts-nocheck
/* eslint-disable */

export const precompiledTemplates: Record<string, { root: unknown }> = {
  "base.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  ";
var tasks = [];
tasks.push(
function(callback) {
env.getTemplate("partials/head.njk", false, "base.njk", false, function(t_2,t_1) {
if(t_2) { cb(t_2); return; }
callback(null,t_1);});
});
tasks.push(
function(template, callback){
template.render(context.getVariables(), frame, function(t_4,t_3) {
if(t_4) { cb(t_4); return; }
callback(null,t_3);});
});
tasks.push(
function(result, callback){
output += result;
callback(null);
});
env.waterfall(tasks, function(){
output += "\n</head>\n<body class=\"bg-white text-gray-900 min-h-screen flex flex-col\">\n\n  ";
var tasks = [];
tasks.push(
function(callback) {
env.getTemplate("partials/nav.njk", false, "base.njk", false, function(t_6,t_5) {
if(t_6) { cb(t_6); return; }
callback(null,t_5);});
});
tasks.push(
function(template, callback){
template.render(context.getVariables(), frame, function(t_8,t_7) {
if(t_8) { cb(t_8); return; }
callback(null,t_7);});
});
tasks.push(
function(result, callback){
output += result;
callback(null);
});
env.waterfall(tasks, function(){
output += "\n  ";
var tasks = [];
tasks.push(
function(callback) {
env.getTemplate("partials/header.njk", false, "base.njk", false, function(t_10,t_9) {
if(t_10) { cb(t_10); return; }
callback(null,t_9);});
});
tasks.push(
function(template, callback){
template.render(context.getVariables(), frame, function(t_12,t_11) {
if(t_12) { cb(t_12); return; }
callback(null,t_11);});
});
tasks.push(
function(result, callback){
output += result;
callback(null);
});
env.waterfall(tasks, function(){
output += "\n\n  <main class=\"flex-1 max-w-5xl mx-auto w-full px-4 py-8\">\n    ";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_14,t_13) {
if(t_14) { cb(t_14); return; }
output += t_13;
output += "\n  </main>\n\n  ";
var tasks = [];
tasks.push(
function(callback) {
env.getTemplate("partials/footer.njk", false, "base.njk", false, function(t_16,t_15) {
if(t_16) { cb(t_16); return; }
callback(null,t_15);});
});
tasks.push(
function(template, callback){
template.render(context.getVariables(), frame, function(t_18,t_17) {
if(t_18) { cb(t_18); return; }
callback(null,t_17);});
});
tasks.push(
function(result, callback){
output += result;
callback(null);
});
env.waterfall(tasks, function(){
output += "\n\n  <!-- HTMX — https://htmx.org -->\n  <script src=\"https://unpkg.com/htmx.org@2.0.4\" integrity=\"sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+\" crossorigin=\"anonymous\"></script>\n  <script>\n    if ('serviceWorker' in navigator) {\n      navigator.serviceWorker.register('/sw.js');\n    }\n  </script>\n</body>\n</html>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})})})})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = 11;
var colno = 7;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

  })(),
  "pages/login.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("base.njk", true, "pages/login.njk", false, function(t_3,t_2) {
if(t_3) { cb(t_3); return; }
parentTemplate = t_2
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_5,t_4) {
if(t_5) { cb(t_5); return; }
output += t_4;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = 2;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += "\n<div class=\"max-w-md mx-auto mt-8\">\n  <h2 class=\"text-xl font-semibold mb-6\">Log in to your account</h2>\n\n  ";
if(runtime.contextOrFrameLookup(context, frame, "error")) {
output += "\n    <div class=\"mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm\">\n      ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "error"), env.opts.autoescape);
output += "\n    </div>\n  ";
;
}
output += "\n\n  <!--\n    Works as a standard HTML form POST (no JS required).\n    When htmx is available, hx-post intercepts submission for a smoother UX.\n  -->\n  <form\n    method=\"POST\"\n    action=\"/auth/login\"\n    hx-post=\"/auth/login\"\n    hx-target=\"body\"\n    hx-push-url=\"true\"\n    class=\"space-y-4\"\n  >\n    <input type=\"hidden\" name=\"_csrf\" value=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "csrfToken"), env.opts.autoescape);
output += "\" />\n\n    <div>\n      <label for=\"username\" class=\"block text-sm font-medium text-gray-700 mb-1\">\n        Username\n      </label>\n      <input\n        id=\"username\"\n        name=\"username\"\n        type=\"text\"\n        required\n        autocomplete=\"username\"\n        class=\"w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n      />\n    </div>\n\n    <div>\n      <label for=\"password\" class=\"block text-sm font-medium text-gray-700 mb-1\">\n        Password\n      </label>\n      <input\n        id=\"password\"\n        name=\"password\"\n        type=\"password\"\n        required\n        autocomplete=\"current-password\"\n        class=\"w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n      />\n    </div>\n\n    <!-- Cloudflare Turnstile widget -->\n    <div\n      class=\"cf-turnstile\"\n      data-sitekey=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "turnstileSiteKey"), env.opts.autoescape);
output += "\"\n      data-callback=\"onTurnstileSuccess\"\n    ></div>\n    <input type=\"hidden\" name=\"turnstileToken\" id=\"turnstileToken\" />\n\n    <button\n      type=\"submit\"\n      class=\"w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors\"\n    >\n      Log in\n    </button>\n  </form>\n\n  <p class=\"mt-4 text-sm text-gray-600 text-center\">\n    Don't have an account?\n    <a href=\"/auth/signup\" class=\"text-indigo-600 hover:underline\">Sign up</a>\n  </p>\n</div>\n\n<script src=\"https://challenges.cloudflare.com/turnstile/v0/api.js\" async defer></script>\n<script>\n  function onTurnstileSuccess(token) {\n    document.getElementById('turnstileToken').value = token;\n  }\n</script>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

  })(),
  "pages/notes/detail.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("base.njk", true, "pages/notes/detail.njk", false, function(t_3,t_2) {
if(t_3) { cb(t_3); return; }
parentTemplate = t_2
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_5,t_4) {
if(t_5) { cb(t_5); return; }
output += t_4;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = 2;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += "\n<div class=\"max-w-2xl mx-auto\">\n  <div class=\"flex items-center justify-between mb-4\">\n    <h2 class=\"text-xl font-semibold truncate\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"title"), env.opts.autoescape);
output += "</h2>\n    <div class=\"flex items-center gap-3 flex-shrink-0 ml-4\">\n      <a\n        href=\"/notes/";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"id"), env.opts.autoescape);
output += "/edit\"\n        class=\"text-sm text-indigo-600 hover:underline\"\n      >Edit</a>\n      <form\n        method=\"POST\"\n        action=\"/notes/";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"id"), env.opts.autoescape);
output += "/delete\"\n        hx-post=\"/notes/";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"id"), env.opts.autoescape);
output += "/delete\"\n        hx-push-url=\"/notes\"\n        hx-confirm=\"Delete this note?\"\n      >\n        <input type=\"hidden\" name=\"_csrf\" value=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "csrfToken"), env.opts.autoescape);
output += "\" />\n        <button type=\"submit\" class=\"text-sm text-red-500 hover:text-red-700 transition-colors\">\n          Delete\n        </button>\n      </form>\n    </div>\n  </div>\n\n  <div class=\"text-xs text-gray-400 mb-6\">\n    Created ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"created_at"), env.opts.autoescape);
output += "\n    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"updated_at") !== runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"created_at")) {
output += " · Updated ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"updated_at"), env.opts.autoescape);
;
}
output += "\n  </div>\n\n  <div class=\"prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"body"), env.opts.autoescape);
output += "</div>\n\n  <div class=\"mt-8\">\n    <a href=\"/notes\" class=\"text-sm text-gray-500 hover:text-gray-700\">&larr; All notes</a>\n  </div>\n</div>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

  })(),
  "pages/notes/form.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("base.njk", true, "pages/notes/form.njk", false, function(t_3,t_2) {
if(t_3) { cb(t_3); return; }
parentTemplate = t_2
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_5,t_4) {
if(t_5) { cb(t_5); return; }
output += t_4;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = 2;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += "\n<div class=\"max-w-2xl mx-auto\">\n  <h2 class=\"text-xl font-semibold mb-6\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.opts.autoescape);
output += "</h2>\n\n  ";
if(runtime.contextOrFrameLookup(context, frame, "error")) {
output += "\n    <div class=\"mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm\">\n      ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "error"), env.opts.autoescape);
output += "\n    </div>\n  ";
;
}
output += "\n\n  <!--\n    Works as a standard HTML form POST (no JS required).\n    When HTMX is available, hx-post intercepts submission for a smoother UX.\n  -->\n  <form\n    method=\"POST\"\n    action=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "action"), env.opts.autoescape);
output += "\"\n    hx-post=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "action"), env.opts.autoescape);
output += "\"\n    hx-target=\"body\"\n    hx-push-url=\"true\"\n    class=\"space-y-4\"\n  >\n    <input type=\"hidden\" name=\"_csrf\" value=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "csrfToken"), env.opts.autoescape);
output += "\" />\n\n    <div>\n      <label for=\"title\" class=\"block text-sm font-medium text-gray-700 mb-1\">\n        Title <span class=\"text-red-500\">*</span>\n      </label>\n      <input\n        id=\"title\"\n        name=\"title\"\n        type=\"text\"\n        required\n        maxlength=\"200\"\n        value=\"";
output += runtime.suppressValue((runtime.contextOrFrameLookup(context, frame, "note")?runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"title"):""), env.opts.autoescape);
output += "\"\n        class=\"w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n        placeholder=\"Note title\"\n      />\n    </div>\n\n    <div>\n      <label for=\"body\" class=\"block text-sm font-medium text-gray-700 mb-1\">\n        Body\n      </label>\n      <textarea\n        id=\"body\"\n        name=\"body\"\n        rows=\"10\"\n        maxlength=\"10000\"\n        class=\"w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono\"\n        placeholder=\"Write your note here...\"\n      >";
output += runtime.suppressValue((runtime.contextOrFrameLookup(context, frame, "note")?runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"body"):""), env.opts.autoescape);
output += "</textarea>\n    </div>\n\n    <div class=\"flex items-center gap-3\">\n      <button\n        type=\"submit\"\n        class=\"bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors\"\n      >\n        ";
output += runtime.suppressValue((runtime.contextOrFrameLookup(context, frame, "note")?"Save changes":"Create note"), env.opts.autoescape);
output += "\n      </button>\n      <a\n        href=\"";
output += runtime.suppressValue((runtime.contextOrFrameLookup(context, frame, "note")?"/notes/" + runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "note")),"id"):"/notes"), env.opts.autoescape);
output += "\"\n        class=\"text-sm text-gray-500 hover:text-gray-700\"\n      >\n        Cancel\n      </a>\n    </div>\n  </form>\n</div>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

  })(),
  "pages/notes/list.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("base.njk", true, "pages/notes/list.njk", false, function(t_3,t_2) {
if(t_3) { cb(t_3); return; }
parentTemplate = t_2
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_5,t_4) {
if(t_5) { cb(t_5); return; }
output += t_4;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = 2;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += "\n<div class=\"max-w-2xl mx-auto\">\n  <div class=\"flex items-center justify-between mb-6\">\n    <h2 class=\"text-xl font-semibold\">My Notes</h2>\n    <a\n      href=\"/notes/new\"\n      class=\"bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors\"\n    >\n      + New Note\n    </a>\n  </div>\n\n  ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "notes")),"length") === 0) {
output += "\n    <p class=\"text-gray-500 text-sm\">No notes yet. <a href=\"/notes/new\" class=\"text-indigo-600 hover:underline\">Create your first note.</a></p>\n  ";
;
}
else {
output += "\n    <ul class=\"divide-y divide-gray-200 border border-gray-200 rounded\" id=\"notes-list\">\n      ";
frame = frame.push();
var t_8 = runtime.contextOrFrameLookup(context, frame, "notes");
if(t_8) {t_8 = runtime.fromIterator(t_8);
var t_7 = t_8.length;
for(var t_6=0; t_6 < t_8.length; t_6++) {
var t_9 = t_8[t_6];
frame.set("note", t_9);
frame.set("loop.index", t_6 + 1);
frame.set("loop.index0", t_6);
frame.set("loop.revindex", t_7 - t_6);
frame.set("loop.revindex0", t_7 - t_6 - 1);
frame.set("loop.first", t_6 === 0);
frame.set("loop.last", t_6 === t_7 - 1);
frame.set("loop.length", t_7);
output += "\n        <li class=\"flex items-center justify-between px-4 py-3 hover:bg-gray-50\">\n          <a href=\"/notes/";
output += runtime.suppressValue(runtime.memberLookup((t_9),"id"), env.opts.autoescape);
output += "\" class=\"text-sm font-medium text-gray-900 hover:text-indigo-600 truncate flex-1\">\n            ";
output += runtime.suppressValue(runtime.memberLookup((t_9),"title"), env.opts.autoescape);
output += "\n          </a>\n          <form\n            method=\"POST\"\n            action=\"/notes/";
output += runtime.suppressValue(runtime.memberLookup((t_9),"id"), env.opts.autoescape);
output += "/delete\"\n            class=\"ml-4 flex-shrink-0\"\n            hx-post=\"/notes/";
output += runtime.suppressValue(runtime.memberLookup((t_9),"id"), env.opts.autoescape);
output += "/delete\"\n            hx-target=\"#notes-list\"\n            hx-swap=\"outerHTML\"\n            hx-confirm=\"Delete this note?\"\n          >\n            <input type=\"hidden\" name=\"_csrf\" value=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "csrfToken"), env.opts.autoescape);
output += "\" />\n            <button\n              type=\"submit\"\n              class=\"text-xs text-red-500 hover:text-red-700 transition-colors\"\n            >\n              Delete\n            </button>\n          </form>\n        </li>\n      ";
;
}
}
frame = frame.pop();
output += "\n    </ul>\n  ";
;
}
output += "\n</div>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

  })(),
  "pages/signup.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("base.njk", true, "pages/signup.njk", false, function(t_3,t_2) {
if(t_3) { cb(t_3); return; }
parentTemplate = t_2
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_5,t_4) {
if(t_5) { cb(t_5); return; }
output += t_4;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = 2;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
output += "\n<div class=\"max-w-md mx-auto mt-8\">\n  <h2 class=\"text-xl font-semibold mb-6\">Create an account</h2>\n\n  ";
if(runtime.contextOrFrameLookup(context, frame, "error")) {
output += "\n    <div class=\"mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm\">\n      ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "error"), env.opts.autoescape);
output += "\n    </div>\n  ";
;
}
output += "\n\n  <!--\n    Works as a standard HTML form POST (no JS required).\n    When htmx is available, hx-post intercepts submission for a smoother UX.\n  -->\n  <form\n    method=\"POST\"\n    action=\"/auth/signup\"\n    hx-post=\"/auth/signup\"\n    hx-target=\"body\"\n    hx-push-url=\"true\"\n    class=\"space-y-4\"\n  >\n    <input type=\"hidden\" name=\"_csrf\" value=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "csrfToken"), env.opts.autoescape);
output += "\" />\n\n    <div>\n      <label for=\"username\" class=\"block text-sm font-medium text-gray-700 mb-1\">\n        Username\n      </label>\n      <input\n        id=\"username\"\n        name=\"username\"\n        type=\"text\"\n        required\n        minlength=\"3\"\n        maxlength=\"32\"\n        pattern=\"[a-zA-Z0-9_]+\"\n        autocomplete=\"username\"\n        class=\"w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n        placeholder=\"your_username\"\n      />\n    </div>\n\n    <div>\n      <label for=\"password\" class=\"block text-sm font-medium text-gray-700 mb-1\">\n        Password\n      </label>\n      <input\n        id=\"password\"\n        name=\"password\"\n        type=\"password\"\n        required\n        minlength=\"8\"\n        maxlength=\"128\"\n        autocomplete=\"new-password\"\n        class=\"w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500\"\n        placeholder=\"At least 8 characters\"\n      />\n    </div>\n\n    <!-- Cloudflare Turnstile widget -->\n    <div\n      class=\"cf-turnstile\"\n      data-sitekey=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "turnstileSiteKey"), env.opts.autoescape);
output += "\"\n      data-callback=\"onTurnstileSuccess\"\n    ></div>\n    <input type=\"hidden\" name=\"turnstileToken\" id=\"turnstileToken\" />\n\n    <button\n      type=\"submit\"\n      class=\"w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors\"\n    >\n      Sign up\n    </button>\n  </form>\n\n  <p class=\"mt-4 text-sm text-gray-600 text-center\">\n    Already have an account?\n    <a href=\"/auth/login\" class=\"text-indigo-600 hover:underline\">Log in</a>\n  </p>\n</div>\n\n<script src=\"https://challenges.cloudflare.com/turnstile/v0/api.js\" async defer></script>\n<script>\n  function onTurnstileSuccess(token) {\n    document.getElementById('turnstileToken').value = token;\n  }\n</script>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

  })(),
  "partials/footer.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<footer class=\"border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-500\">\n  <p>&copy; ";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.contextOrFrameLookup(context, frame, "year"),"2026"), env.opts.autoescape);
output += " My App. Built on Cloudflare Workers.</p>\n</footer>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

  })(),
  "partials/head.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<meta charset=\"UTF-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n<title>";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.contextOrFrameLookup(context, frame, "title"),"App"), env.opts.autoescape);
output += "</title>\n<meta name=\"application-name\" content=\"";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.contextOrFrameLookup(context, frame, "title"),"App"), env.opts.autoescape);
output += "\" />\n<meta name=\"theme-color\" content=\"#4f46e5\" />\n<link rel=\"manifest\" href=\"/manifest.json\" />\n<link rel=\"apple-touch-icon\" href=\"/icons/icon-192.png\" />\n<!-- Tailwind CSS — built via `npm run tailwind:build` (src/styles/app.css → public/app.css) -->\n<link rel=\"stylesheet\" href=\"/app.css\" />\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("head"))(env, context, frame, runtime, function(t_2,t_1) {
if(t_2) { cb(t_2); return; }
output += t_1;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_head(env, context, frame, runtime, cb) {
var lineno = 9;
var colno = 3;
var output = "";
try {
var frame = frame.push(true);
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_head: b_head,
root: root
};

  })(),
  "partials/header.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<header class=\"bg-gray-50 border-b border-gray-200 py-8\">\n  <div class=\"max-w-5xl mx-auto px-4\">\n    <h1 class=\"text-2xl font-bold text-gray-900\">";
output += runtime.suppressValue(env.getFilter("default").call(context, runtime.contextOrFrameLookup(context, frame, "pageTitle"),runtime.contextOrFrameLookup(context, frame, "title")), env.opts.autoescape);
output += "</h1>\n  </div>\n</header>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

  })(),
  "partials/nav.njk": (function() {
function root(env, context, frame, runtime, cb) {
var lineno = 0;
var colno = 0;
var output = "";
try {
var parentTemplate = null;
output += "<nav class=\"bg-white border-b border-gray-200\">\n  <div class=\"max-w-5xl mx-auto px-4 py-3 flex items-center justify-between\">\n    <a href=\"/\" class=\"font-semibold text-gray-900 text-lg\">My App</a>\n    <div class=\"flex gap-4 text-sm\">\n      ";
if(runtime.contextOrFrameLookup(context, frame, "user")) {
output += "\n        <span class=\"text-gray-600\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "user")),"username"), env.opts.autoescape);
output += "</span>\n        <form method=\"POST\" action=\"/auth/logout\" class=\"inline\">\n          <input type=\"hidden\" name=\"_csrf\" value=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "csrfToken"), env.opts.autoescape);
output += "\">\n          <button type=\"submit\" class=\"text-red-600 hover:underline\">Log out</button>\n        </form>\n      ";
;
}
else {
output += "\n        <a href=\"/auth/login\" class=\"text-gray-700 hover:underline\">Log in</a>\n        <a href=\"/auth/signup\" class=\"text-indigo-600 hover:underline font-medium\">Sign up</a>\n      ";
;
}
output += "\n    </div>\n  </div>\n</nav>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

  })()
};
