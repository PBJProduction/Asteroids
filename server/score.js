var fs = require('fs');

var score = (function () {
    'use strict';

    var scores = {};

    function init() {
        fs.readFile('./scores/score.txt', 'utf8', function(err, data) {
            if (err) {
                return console.log("scores.txt not made yet");
            } else {
                var s = JSON.parse(data);
                var sorted = Object.keys(s).sort(function(a, b){
                    return s[a] - s[b];
                });

                for (var index in sorted) {
                    scores[sorted[index]] = s[sorted[index]]
                }
            }
        });
    }

    function post(data) {
        var newScores = {};
        scores[data.name] = data.score;
        var sorted = Object.keys(scores).sort(function(a, b){
            return scores[a] - scores[b];
        });

        for (var index in sorted) {
            newScores[sorted[index]] = scores[sorted[index]]
        }
        scores = newScores;

        fs.writeFile('./scores/score.txt', JSON.stringify(newScores), function(err) {
            if (err) {
                console.log(err);
            }
        })
    }

    return {
        init: init,
        post: post
    }
}());

module.exports = score;

