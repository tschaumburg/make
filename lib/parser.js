const path = require('path');

module.exports = parse;


// returns
//   {
//     variables = {
//       "VARIABLE1": "value1",
//       "VARIABLE2": "value2",
//     },
//     targets = [
//       {
//         "target": "TARGET1",
//         "prerequities": ["PREREQUISITE1", "PREREQUISITE2"],
//         "recipe": "recipe1\nrecipe2\n...",
//       }
//     ]
//   }
function parse(makefileDir, content) {
    content = content.replace("\\\r\n", "").replace("\\\n\r", "").replace("\\\n", "");

  var lines = content.split(/\r?\n/);

  var variables = {};
  var targets = [];

  // reference to last parsed target
  var last = {};

  // VARIABLE = "value"
  // ===================
  var tokens = {
    '\\w+\\s?=\\s*"[^"]*"': function(line) {
      //console.log("STEP var");
      var reg = /(\w+)\s?=\s?"([^"]*)"/;
      var parts = line.match(reg);
      var name = parts[1];
      var value = parts[2];

      // recursive variable definitions:
      value = value.replace(/\$(\w+)/g, function (match, name)
      {
        if (variables[name]) return variables[name];
        return match;
      });

      variables[name] = value;
    },

    // TARGET: PREREQUISITE1 PREREQUISITE2 ...
    // ========================================
    '^[\\w\\$][^:]+\\s?:': function(line) {
      //console.log("STEP target");
      var reg = /^([^:]+)\s?:\s?(.*)/;
      var parts = line.match(reg);
      var target = parts[1];
      var prerequities = parts[2].split(/\s+/);

      // variable substitution in TARGET:
      target = target.replace(/\$(\w+)/g, function (match, name)
      {
        if (variables[name]) return variables[name];
        return match;
      });

      //console.log("TARGET=" + target);
      
      // variable substitution in TARGET:
      prerequities = prerequities.map(function (prereq)
      {
        prereq = prereq.replace(/\$(\w+)/g, function (match, name)
        {
          if (variables[name])
            return variables[name];

          return match;
        });
        //console.log("PREREQUISITE=" + prereq);
        return prereq;
      });

      last = {
        targetName: target,
        target: path.resolve(makefileDir, target),
        prerequisiteNames: prerequities,
        prerequities: prerequities.map((f) => path.resolve(makefileDir, f)),
        recipe: ''
      };

      targets.push(last);
    },

    // RULE
    // ==============
    // Rule declaration (anything tabed by one indentation)
    '^(\\s\\s|\\t)': function(line) {
      //console.log("STEP rule");
      var reg = /(\s+|\t+)(.*)/;
      var parts = line.match(reg);
      var rule = parts[2];

      // Var substitution for rules
      rule = rule.replace(/\$(\w+)/, function(match, name) {
        if (variables[name]) return variables[name];
        return match;
      });

        if (last.recipe)
            last.recipe += '\n' + rule;
        else
            last.recipe = rule;
    }
  };

  lines.forEach(function(line) {
    //console.log("LINE " + line);
    if (!line) return;

    Object.keys(tokens).forEach(function(token) {
      var reg = new RegExp(token);
      if (reg.test(line)) tokens[token](line);
    });
  });

  return {
    variables: variables,
    targets: targets
  };
}
