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

export var target = [''];
export var expected =
    [
        'second',
    ];

export var env = {
    'MAKEFILES': 'Makefile2'
};
