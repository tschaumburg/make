export var makefiles =
    [
        [
            'p1 p2:',
            '',
            't1 t2: p1 p2',
            '   echo build1 build2',
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1 p2',
            '   echo build1\\',
            'build2',
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1 p2',
            '   echo build1\\',
            '        build2',
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1 p2',
            '   echo build1\\',
            '              \\',
            '        build2',
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1\\',
            'p2',
            '   echo build1 build2'
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1\\',
            '       p2',
            '   echo build1 build2'
        ],
        [
            'p1 p2:',
            '',
            't1 t2: p1\\',
            '         \\',
            '       p2',
            '   echo build1 build2'
        ],
        [
            'p1 p2:',
            '',
            't1\\',
            't2: p1 p2',
            '   echo build1 build2',
        ],
        [
            'p1 p2:',
            '',
            't1\\',
            '\\',
            't2: p1 p2',
            '   echo build1 build2',
        ]
    ];

export var targets =
    [
        ['t1'],
        ['t2']
    ];
export var expected = "build1 build2";