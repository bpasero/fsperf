var assert = require("assert");
var fs = require("fs");
var npath = require("path");

var fileCount = 0;
var folderCount = 0;

var start = new Date().getTime();
var current = new Date().getTime();

var files = 0;
var iterations = 0;

var USE_STAT = false;

if (USE_STAT) {
  walkStat(__dirname, fs.readdirSync(__dirname), { count: function(isFile) {
    if (isFile) {
      files++;
      if (files%1000 === 0) {
        iterations++;
        var time = (new Date().getTime() - current);
        var avg = Math.round((new Date().getTime() - start) / iterations);
        console.log("[stat] 1000 files took: " + time + "ms (avg " + avg + "ms).");
        current = new Date().getTime();
      }
    }
  }});
} else {
  walkReaddir(__dirname, fs.readdirSync(__dirname), { count: function(isFile) {
    if (isFile) {
      files++;
      if (files%1000 === 0) {
        iterations++;
        var time = (new Date().getTime() - current);
        var avg = Math.round((new Date().getTime() - start) / iterations);
        console.log("[readdir] 1000 files took: " + time + "ms (avg " + avg + "ms).");
        current = new Date().getTime();
      }
    }
  }});
}

function walkStat(path, files, counter) {
  files.forEach(function(file) {
    var filePath = npath.join(path, file);
    fs.stat(filePath, function(error, stat) {
      if (error) {
        console.error(error);
        return;
      }
      
      if (stat.isDirectory()) {
        counter.count(false);
        
        fs.readdir(filePath, function(error, children) {
          walkStat(filePath, children, counter);
        });
      } else {
        counter.count(true);
      }
    });
  });
}

function walkReaddir(path, files, counter) {
  files.forEach(function(file) {
    var filePath = npath.join(path, file);
    fs.readdir(filePath, function(error, children) {
      if (error && error.code !== 'ENOTDIR') {
        console.error(error);
        return;
      }
      
      if (!error) {
        counter.count(false);
        walkStat(filePath, children, counter);
      } else {
        counter.count(true);
      }
    });
  });
}