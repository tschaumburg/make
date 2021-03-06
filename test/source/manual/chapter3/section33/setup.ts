export var makefiles1 =
{
    'Makefile': [
        'first:',
        '\techo first',
        'second:',
        '\techo second',
        'third:',
        '\techo third',
        '',
        'run: first',
        'include Makefile2',
        'run: third',
    ],
    'Makefile2': [
        'run:second'
    ]
};

export var targets1 = ['run'];
export var expected1 =
    [
        'first',
        'second',
        'third'
    ];

export var makefiles =
    [
        [
            'p1 p2:',
            '',
            't1 t2: p1 p2',
            '\techo build1 build2',
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1 p2',
            '\techo build1\\',
            'build2',
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1 p2',
            '\techo build1\\',
            '\t     build2',
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1 p2',
            '\techo build1\\',
            '\t           \\',
            '\t     build2',
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1\\',
            'p2',
            '\techo build1 build2'
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1\\',
            '\t    p2',
            '\techo build1 build2'
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1\\',
            '\t      \\',
            '\t    p2',
            '\techo build1 build2'
        ],
        [
            'p1 p2:',
            '',
            't1\\',
            't2: p1 p2',
            '\techo build1 build2',
        ],
        [
            'p1 p2:',
            '',
            't1\\',
            '\\',
            't2: p1 p2',
            '\techo build1 build2',
        ]
    ];

export var targets =
    [
        ['t1'],
        ['t2']
    ];
export var expected = "build1 build2";