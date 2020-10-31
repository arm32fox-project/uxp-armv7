/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef builtin_Stream_h
#define builtin_Stream_h

#include "vm/NativeObject.h"

namespace js {

class AutoSetNewObjectMetadata;

#define NATIVE_CLASS(name) \
class name : public NativeObject \
{ \
  public: \
    static const ClassSpec classSpec_; \
    static const Class class_; \
    static const ClassSpec protoClassSpec_; \
    static const Class protoClass_; \
};

NATIVE_CLASS(ReadableStream)
NATIVE_CLASS(ReadableStreamDefaultReader)
NATIVE_CLASS(ReadableStreamBYOBReader)
NATIVE_CLASS(ReadableStreamDefaultController)
NATIVE_CLASS(ReadableByteStreamController)
NATIVE_CLASS(ReadableStreamBYOBRequest)

NATIVE_CLASS(ByteLengthQueuingStrategy)
NATIVE_CLASS(CountQueuingStrategy)

#undef NATIVE_CLASS

} // namespace js

#endif /* builtin_Stream_h */
