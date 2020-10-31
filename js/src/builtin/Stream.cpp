/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "builtin/Stream.h"

#include "jscntxt.h"

#include "gc/Heap.h"
#include "vm/SelfHosting.h"

#include "jsobjinlines.h"

#include "vm/NativeObject-inl.h"

using namespace js;

#define CLASS_SPEC(cls, nCtorArgs, methods, properties, nSlots, specFlags) \
const ClassSpec cls::classSpec_ = { \
    GenericCreateConstructor<cls##Constructor, nCtorArgs, gc::AllocKind::FUNCTION>, \
    GenericCreatePrototype, \
    nullptr, \
    nullptr, \
    methods, \
    properties, \
    nullptr, \
    specFlags \
}; \
\
const Class cls::class_ = { \
    #cls, \
    JSCLASS_HAS_RESERVED_SLOTS(nSlots) | \
    JSCLASS_HAS_CACHED_PROTO(JSProto_##cls), \
    JS_NULL_CLASS_OPS, \
    &cls::classSpec_ \
}; \
\
const Class cls::protoClass_ = { \
    "object", \
    JSCLASS_HAS_CACHED_PROTO(JSProto_##cls), \
    JS_NULL_CLASS_OPS, \
    &cls::classSpec_ \
};

// TODO remove. See also https://bugzil.la/1226261
static bool
ReadableStreamConstructor(JSContext* cx, unsigned argc, Value* vp)
{
    CallArgs args = CallArgsFromVp(argc, vp);

    if (!ThrowIfNotConstructing(cx, args, "ReadableStream"))
        return false;

    Rooted<ReadableStream*> readableStream(cx, NewBuiltinClassInstance<ReadableStream>(cx));
    if (!readableStream)
        return false;

    FixedInvokeArgs<2> initArgs(cx);
    initArgs[0].set(args.get(0));
    initArgs[1].set(args.get(1));
    RootedValue thisv(cx, ObjectValue(*readableStream));
    if (!CallSelfHostedFunction(cx, cx->names().ReadableStream, thisv, initArgs, initArgs.rval()))
        return false;

    args.rval().setObject(*readableStream);
    return true;
}

static const JSFunctionSpec ReadableStream_methods[] = {
    JS_SELF_HOSTED_FN("cancel", "ReadableStream_cancel", 1, 0),
    JS_SELF_HOSTED_FN("getReader", "ReadableStream_getReader", 1, 0),
    JS_SELF_HOSTED_FN("pipeThrough", "ReadableStream_pipeThrough", 2, 0),
    JS_SELF_HOSTED_FN("pipeTo", "ReadableStream_pipeTo", 2, 0),
    JS_SELF_HOSTED_FN("tee", "ReadableStream_tee", 0, 0),
    JS_FS_END
};

static const JSPropertySpec ReadableStream_properties[] = {
    JS_SELF_HOSTED_GET("locked", "ReadableStream_locked", 0),
    JS_PS_END
};

CLASS_SPEC(ReadableStream, 0,
           ReadableStream_methods, ReadableStream_properties,
           4, 0);


static bool
ReadableStreamDefaultReaderConstructor(JSContext* cx, unsigned argc, Value* vp)
{
    CallArgs args = CallArgsFromVp(argc, vp);

    if (!ThrowIfNotConstructing(cx, args, "ReadableStreamDefaultReader"))
        return false;

    RootedObject reader(cx, NewBuiltinClassInstance<ReadableStreamDefaultReader>(cx));
    if (!reader)
        return false;

    FixedInvokeArgs<1> initArgs(cx);
    initArgs[0].set(args.get(0));
    RootedValue thisv(cx, ObjectValue(*reader));
    if (!CallSelfHostedFunction(cx, cx->names().ReadableStreamDefaultReader, thisv, initArgs,
        initArgs.rval()))
    {
        return false;
    }

    args.rval().setObject(*reader);
    return true;
}

static const JSFunctionSpec ReadableStreamDefaultReader_methods[] = {
    JS_SELF_HOSTED_FN("cancel", "ReadableStreamDefaultReader_cancel", 1, 0),
    JS_SELF_HOSTED_FN("read", "ReadableStreamDefaultReader_read", 0, 0),
    JS_SELF_HOSTED_FN("releaseLock", "ReadableStreamDefaultReader_releaseLock", 0, 0),
    JS_FS_END
};

static const JSPropertySpec ReadableStreamDefaultReader_properties[] = {
    JS_SELF_HOSTED_GET("closed", "ReadableStreamDefaultReader_closed", 0),
    JS_PS_END
};

CLASS_SPEC(ReadableStreamDefaultReader, 1,
           ReadableStreamDefaultReader_methods, ReadableStreamDefaultReader_properties,
           3, ClassSpec::DontDefineConstructor);


static bool
ReadableStreamBYOBReaderConstructor(JSContext* cx, unsigned argc, Value* vp)
{
    CallArgs args = CallArgsFromVp(argc, vp);

    if (!ThrowIfNotConstructing(cx, args, "ReadableStreamBYOBReader"))
        return false;

    RootedObject reader(cx, NewBuiltinClassInstance<ReadableStreamBYOBReader>(cx));
    if (!reader)
        return false;

    FixedInvokeArgs<1> initArgs(cx);
    initArgs[0].set(args.get(0));
    RootedValue thisv(cx, ObjectValue(*reader));
    if (!CallSelfHostedFunction(cx, cx->names().ReadableStreamBYOBReader, thisv, initArgs,
        initArgs.rval()))
    {
        return false;
    }

    args.rval().setObject(*reader);
    return true;
}

static const JSPropertySpec ReadableStreamBYOBReader_properties[] = {
    JS_SELF_HOSTED_GET("closed", "ReadableStreamBYOBReader_closed", 0),
    JS_PS_END
};

static const JSFunctionSpec ReadableStreamBYOBReader_methods[] = {
    JS_SELF_HOSTED_FN("cancel", "ReadableStreamBYOBReader_cancel", 1, 0),
    JS_SELF_HOSTED_FN("read", "ReadableStreamBYOBReader_read", 1, 0),
    JS_SELF_HOSTED_FN("releaseLock", "ReadableStreamBYOBReader_releaseLock", 0, 0),
    JS_FS_END
};

CLASS_SPEC(ReadableStreamBYOBReader, 1,
           ReadableStreamBYOBReader_methods, ReadableStreamBYOBReader_properties,
           3, ClassSpec::DontDefineConstructor);


static bool
ReadableStreamDefaultControllerConstructor(JSContext* cx, unsigned argc, Value* vp)
{
    CallArgs args = CallArgsFromVp(argc, vp);

    if (!ThrowIfNotConstructing(cx, args, "ReadableStreamDefaultController"))
        return false;

    RootedObject controller(cx, NewBuiltinClassInstance<ReadableStreamDefaultController>(cx));
    if (!controller)
        return false;

    FixedInvokeArgs<4> initArgs(cx);
    initArgs[0].set(args.get(0));
    initArgs[1].set(args.get(1));
    initArgs[2].set(args.get(2));
    initArgs[3].set(args.get(3));
    RootedValue thisv(cx, ObjectValue(*controller));
    if (!CallSelfHostedFunction(cx, cx->names().ReadableStreamDefaultController, thisv,
                                initArgs, initArgs.rval()))
    {
        return false;
    }

    args.rval().setObject(*controller);
    return true;
}

static const JSPropertySpec ReadableStreamDefaultController_properties[] = {
    JS_SELF_HOSTED_GET("desiredSize", "ReadableStreamDefaultController_desiredSize", 0),
    JS_PS_END
};

static const JSFunctionSpec ReadableStreamDefaultController_methods[] = {
    JS_SELF_HOSTED_FN("close", "ReadableStreamDefaultController_close", 0, 0),
    JS_SELF_HOSTED_FN("enqueue", "ReadableStreamDefaultController_enqueue", 1, 0),
    JS_SELF_HOSTED_FN("error", "ReadableStreamDefaultController_error", 1, 0),
    JS_FS_END
};

CLASS_SPEC(ReadableStreamDefaultController, 4,
           ReadableStreamDefaultController_methods, ReadableStreamDefaultController_properties,
           7, ClassSpec::DontDefineConstructor);


static bool
ReadableByteStreamControllerConstructor(JSContext* cx, unsigned argc, Value* vp)
{
    CallArgs args = CallArgsFromVp(argc, vp);

    if (!ThrowIfNotConstructing(cx, args, "ReadableByteStreamController"))
        return false;

    RootedObject controller(cx, NewBuiltinClassInstance<ReadableByteStreamController>(cx));
    if (!controller)
        return false;

    FixedInvokeArgs<3> initArgs(cx);
    initArgs[0].set(args.get(0));
    initArgs[1].set(args.get(1));
    initArgs[2].set(args.get(2));
    RootedValue thisv(cx, ObjectValue(*controller));
    if (!CallSelfHostedFunction(cx, cx->names().ReadableByteStreamController, thisv, initArgs,
        initArgs.rval()))
    {
        return false;
    }

    args.rval().setObject(*controller);
    return true;
}

static const JSPropertySpec ReadableByteStreamController_properties[] = {
    JS_SELF_HOSTED_GET("byobRequest", "ReadableByteStreamController_byobRequest", 0),
    JS_SELF_HOSTED_GET("desiredSize", "ReadableByteStreamController_desiredSize", 0),
    JS_PS_END
};

static const JSFunctionSpec ReadableByteStreamController_methods[] = {
    JS_SELF_HOSTED_FN("close", "ReadableByteStreamController_close", 0, 0),
    JS_SELF_HOSTED_FN("enqueue", "ReadableByteStreamController_enqueue", 1, 0),
    JS_SELF_HOSTED_FN("error", "ReadableByteStreamController_error", 1, 0),
    JS_FS_END
};

CLASS_SPEC(ReadableByteStreamController, 3,
           ReadableByteStreamController_methods, ReadableByteStreamController_properties,
           9, ClassSpec::DontDefineConstructor);


static bool
ReadableStreamBYOBRequestConstructor(JSContext* cx, unsigned argc, Value* vp)
{
    CallArgs args = CallArgsFromVp(argc, vp);

    if (!ThrowIfNotConstructing(cx, args, "ReadableStreamBYOBRequest"))
        return false;

    RootedObject request(cx, NewBuiltinClassInstance<ReadableStreamBYOBRequest>(cx));
    if (!request)
        return false;

    FixedInvokeArgs<3> initArgs(cx);
    initArgs[0].set(args.get(0));
    initArgs[1].set(args.get(1));
    initArgs[2].set(args.get(2));
    RootedValue thisv(cx, ObjectValue(*request));
    if (!CallSelfHostedFunction(cx, cx->names().ReadableStreamBYOBRequest,
                                thisv, initArgs, initArgs.rval()))
    {
        return false;
    }

    args.rval().setObject(*request);
    return true;
}

static const JSPropertySpec ReadableStreamBYOBRequest_properties[] = {
    JS_SELF_HOSTED_GET("view", "ReadableStreamBYOBRequest_view", 0),
    JS_PS_END
};

static const JSFunctionSpec ReadableStreamBYOBRequest_methods[] = {
    JS_SELF_HOSTED_FN("respond", "ReadableStreamBYOBRequest_respond", 1, 0),
    JS_SELF_HOSTED_FN("respondWithNewView", "ReadableStreamBYOBRequest_respondWithNewView", 1, 0),
    JS_FS_END
};

CLASS_SPEC(ReadableStreamBYOBRequest, 3,
           ReadableStreamBYOBRequest_methods, ReadableStreamBYOBRequest_properties,
           2, ClassSpec::DontDefineConstructor);


static bool
ByteLengthQueuingStrategyConstructor(JSContext* cx, unsigned argc, Value* vp)
{
    CallArgs args = CallArgsFromVp(argc, vp);

    RootedObject strategy(cx, NewBuiltinClassInstance<ByteLengthQueuingStrategy>(cx));
    if (!strategy)
        return false;

    RootedObject argObj(cx, ToObject(cx, args.get(0)));
    if (!argObj)
      return false;

    RootedValue highWaterMark(cx);
    if (!GetProperty(cx, argObj, argObj, cx->names().highWaterMark, &highWaterMark))
      return false;

    if (!SetProperty(cx, strategy, cx->names().highWaterMark, highWaterMark))
      return false;

    args.rval().setObject(*strategy);
    return true;
}

static const JSFunctionSpec ByteLengthQueuingStrategy_methods[] = {
    JS_SELF_HOSTED_FN("size", "ByteLengthQueuingStrategy_size", 1, 0),
    JS_FS_END
};

CLASS_SPEC(ByteLengthQueuingStrategy, 1,
           ByteLengthQueuingStrategy_methods, nullptr,
           0, 0);

static bool
CountQueuingStrategyConstructor(JSContext* cx, unsigned argc, Value* vp)
{
    CallArgs args = CallArgsFromVp(argc, vp);

    Rooted<CountQueuingStrategy*> strategy(cx, NewBuiltinClassInstance<CountQueuingStrategy>(cx));
    if (!strategy)
        return false;

    RootedObject argObj(cx, ToObject(cx, args.get(0)));
    if (!argObj)
      return false;

    RootedValue highWaterMark(cx);
    if (!GetProperty(cx, argObj, argObj, cx->names().highWaterMark, &highWaterMark))
      return false;

    if (!SetProperty(cx, strategy, cx->names().highWaterMark, highWaterMark))
      return false;

    args.rval().setObject(*strategy);
    return true;
}

static const JSFunctionSpec CountQueuingStrategy_methods[] = {
    JS_SELF_HOSTED_FN("size", "CountQueuingStrategy_size", 0, 0),
    JS_FS_END
};

CLASS_SPEC(CountQueuingStrategy, 1,
           CountQueuingStrategy_methods, nullptr,
           0, 0);

#undef CLASS_SPEC
