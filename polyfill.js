// Polyfill for global.File under Node.js < 20
if (typeof global.File === 'undefined') {
  const { Blob } = require('buffer');
  global.File = class File extends (global.Blob || Blob) {
    constructor(parts, filename, options = {}) {
      super(parts, options);
      this.name = filename;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}
