
module.exports = parse;


function parse(content) {

  var lines = content.split(/\r?\n/);

  var variables = {};
  var targets = {};

  // reference to last parsed target
  var last;

  var tokens = {
    // var declartion
    '\\w+\\s?=.*': function(line) {
      var reg = /(\w+)\s? = \s?(.*)/;
      var parts = line.match(reg);
      var name = parts[1];
      var value = parts[2];

      variables[name] = value;

    },

    // Target declaration
    '\[^:]+\\s?:': function(line) {
      var reg = /([^:]+)\s?:\s?(.*)/;
      var parts = line.match(reg);
      var target = parts[1];
      var prerequities = parts[2];

      last = targets[target] = {
        prerequities: parts[2],
        recipe: ''
      };

    },

    // Rule declaration (anything tabed by one indentation)
    '^(\\s\\s|\\t)': function(line) {
      var reg = /(\s+|\t+)(.*)/;
      var parts = line.match(reg);
      var rule = parts[2];

      // TODO: Var substitution for everything, not just rules
      rule = rule.replace(/\$(\w+)/, function(match, name) {
        if (variables[name]) return variables[name];
        return match;
      });

      last.recipe += rule + '\n';
    }
  };


  lines.forEach(function(line) {
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