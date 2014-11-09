module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      all: ['js/*.js']
    },
    uglify: {
      client: {
        src: ['js/chartOptions.js', 'js/client.js'],
        dest: 'dist/client.min.js'
      },
      server: {
        src: ['js/db.js', 'js/server.js'],
        dest: 'dist/server.min.js'
      },
      fetch: {
        src: ['js/fetch.js'],
        dest: 'dist/fetch.min.js'
      }
    },
    watch: {
      files: ['js/*.js'],
      tasks: [
        'jshint:all',
        'uglify:client',
        'uglify:server',
        'uglify:fetch'
      ]
    }
});
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.registerTask('default', ['jshint', 'uglify']);
};