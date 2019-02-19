export var makefile =
{
    'Makefile': [
        'second:',
        '\techo second',
        '',
        'run: second',
    ],
    'Makefile2': [
        'first:',
        '\techo first',
        '',
        'run:first'
    ]
};

export var target = ['run'];
export var expected =
    [
        'first',
        'second',
    ];

export var env = {
    'MAKEFILES': 'Makefile2'
};
