// import * as mocha from "mocha";
// import { deleteFiles, touchFiles, multiTestcase } from "../../.."

// export function loadTests(baseDir: string): void
// {
//     describe('23A: Testing recursive out-of-date detection ', function ()
//     {
//         multiTestcase(
//             {
//                 id: "23A",
//                 title: "",
//                 makefile: [
//                     'objects = main.o kbd.o',
//                     'edit : $(objects)',
//                     '\techo build edit',
//                     '\tnodetouch edit',
//                     'main.o : main.c defs.h',
//                     '\techo build main.o',
//                     '\tnodetouch main.o',
//                     'kbd.o : kbd.c defs.h command.h',
//                     '\techo build kbd.o',
//                     '\tnodetouch kbd.o',
//                     'clean :',
//                     '\trm edit $(objects)'
//                 ],
//             },
//             // // +------+------------+--------------------+---------+-----------------+
//             // // | case |    Setup   |      Prepare       | Targets | Expected output |
//             // // +------+------------+--------------------+---------+-----------------+
//             // // |      | edit-setup |                    |         |   build main.o  |
//             // // |      |            |                    |         |   build kbd.o   |
//             // // |      |            |                    |         |   build edit    |
//             // // +------+------------+--------------------+---------+-----------------+
//             // {
//             //     title: "all",
//             //     prepare: clean,
//             //     targets: ["edit"],
//             //     expect:
//             //         [
//             //             'build main.o',
//             //             'build kbd.o',
//             //             'build edit'
//             //         ]
//             // },
//             //
//             //   "The recompilation must be done if the source file, or any of the header 
//             //    files named as prerequisites, is more recent than the object file, or if
//             //    the object file does not exist."
//             //
//             // +------+------------+--------------------+---------+-----------------+
//             // | case |    Setup   |      Prepare       | Targets | Expected output | Comment
//             // +------+------------+--------------------+---------+-----------------+
//             // |      | edit-setup |                    | foobar  |   build foo.o   | Brings all
//             // |      |            |                    |         |   build bar.o   | targets up-
//             // |      |            |                    |         |   build foobar  | to-date.
//             // |      |            +--------------------+---------+-----------------+
//             // |      |            |                    | foobar  |                 | Proves steady-state
//             // |      |            +--------------------+---------+-----------------+
//             // |      |            |   touch("bar.h")   | foobar  |   build bar.o   | Update prerequisite
//             // |      |            |                    |         |   build foobar  | => updates needed
//             // |      |            +--------------------+---------+-----------------+
//             // |      |            |                    | foobar  |                 | Proves steady-state
//             // |      |            +--------------------+---------+-----------------+
//             // |      |            |  delete("foo.o")   | foobar  |   build foo.o   | Delete prerequisite
//             // |      |            |                    |         |   build foobar  | => updates needed
//             // |      |            +--------------------+---------+-----------------+
//             // |      |            |                    | foobar  |                 | Proves steady-state
//             // |      |            +--------------------+---------+-----------------+
//             // |      |            | touch("shared.h")  | foobar  |   build foo.o   | Update shared 
//             // |      |            |                    |         |   build bar.o   | prerequisite =>
//             // |      |            |                    |         |   build foobar  | more updates needed
//             // +------+------------+--------------------+---------+-----------------+
//             //
//             {
//                 title: "none",
//                 prepare: () => { },
//                 targets: ["edit"],
//                 expect: ["'edit' is up to date"]
//             },
//             {
//                 title: "header changed",
//                 prepare: () => { touchFiles('command.h'); },
//                 targets: ["edit"],
//                 expect:
//                     [
//                         'build kbd.o',
//                         'build edit'
//                     ]
//             },
//             {
//                 title: "global-use header changed",
//                 prepare: () => { touchFiles('defs.h'); },
//                 targets: ["edit"],
//                 expect:
//                     [
//                         'build main.o',
//                         'build kbd.o',
//                         'build edit'
//                     ]
//             },
//             {
//                 title: "source-file changed",
//                 prepare: () => { touchFiles('main.c'); },
//                 targets: ["edit"],
//                 expect:
//                     [
//                         'build main.o',
//                         'build edit'
//                     ]
//             }
//         );
//     });
// }

// function clean(): void
// {
//     deleteFiles('./*.o', '!./Makefile');
//     touchFiles("main.c", "kbd.c", "defs.h", "command.h");
// }
