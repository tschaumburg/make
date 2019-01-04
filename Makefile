objects = main.o kbd.o 
edit foo: $(objects) 
	echo build edit
	nodetouch edit
main.o : main.c defs.h
	echo build main.o
	nodetouch main.o
kbd.o : kbd.c defs.h command.h
	echo build kbd.o
	nodetouch kbd.o
clean :
	rm edit $(objects)
