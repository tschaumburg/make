ROOT = "."
FAMILY = "core"
PACKAGE = "tokens"
VERSION = "1.2.3"

PUBDIR = "./publish"
DEVDIR = "./subdir"

# PRE-PUBLISH:
# ============
#    ./publish/hafnium-core-login <= ./packages/core/core-tokens-tokens
$PUBDIR/hafnium-$FFAMILY-$PACKAGE-$VERSION.tgz: $DEVDIR/package.json $DEVDIR/dist/**/* $DEVDIR/types/**/* $DEVDIR/hafnium/**/*
  	echo "cd $PUBDIR && npm pack $DEVDIR"

# BUILD
# ========
include $DEVDIR/Makefile

$DEVDIR/hafnium/**/*: $DEVDIR/schema/**/* 


packages/$PACKAGE/dist:
	echo build $PACKAGE

build/$PACKAGE-$VERSION.tgz: packages/$PACKAGE/dist
	echo npm pack packages/$PACKAGE/dist

tgz: $PUBDIR/hafnium-$FFAMILY-$PACKAGE-$VERSION.tgz












$PUBDIR/hafnium-$FAMILY-$PACKAGE-$VERSION.tgz: $DEVDIR/package.json $DEVDIR/dist/**/* $DEVDIR/types/**/* $DEVDIR/hafnium/**/*
  	echo "cd $PUBDIR && npm pack $DEVDIR"

tgz: $PUBDIR/hafnium-$FAMILY-$PACKAGE-$VERSION.tgz
