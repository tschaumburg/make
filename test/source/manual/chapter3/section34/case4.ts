export var makefile =
{
    'Makefile': [
        'second:',
        '\techo second',
        '',
        'run: second',
    ],
    'Makefile2x': [
        'first:',
        '\techo first',
        '',
        'run:first'
    ]
};

export var target = ['run'];
export var expected =
    [
        'second',
    ];

export var env = {
    'MAKEFILES': 'Makefile2'
};
