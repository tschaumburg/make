3.4 The Variable MAKEFILES
If the environment variable MAKEFILES is defined, make considers its value as a 
list of names (separated by whitespace) of additional makefiles to be read before 
the others. 

case 1

This works much like the include directive: various directories are searched for 
those files (see Including Other Makefiles). 

Case 2

In addition, the default goal is never taken from one of these makefiles (or any
makefile included by them) 

Case 3

and it is not an error if the files listed in MAKEFILES are not found.

case 4

The main use of MAKEFILES is in communication between recursive invocations of 
make (see Recursive Use of make). It usually is not desirable to set the environment
variable before a top-level invocation of make, because it is usually better not to
mess with a makefile from outside. 

However, if you are running make without a specific makefile, a makefile in 
MAKEFILES can do useful things to help the built-in implicit rules work better,
such as defining search paths (see Directory Search).

Some users are tempted to set MAKEFILES in the environment automatically on login,
and program makefiles to expect this to be done. This is a very bad idea, because 
such makefiles will fail to work if run by anyone else. It is much better to write 
explicit include directives in the makefiles. See Including Other Makefiles.

