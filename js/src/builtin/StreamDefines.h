/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Specialized .h file to be used by both JS and C++ code.

#ifndef builtin_StreamDefines_h
#define builtin_StreamDefines_h

#define READABLESTREAM_STATE_READABLE 1
#define READABLESTREAM_STATE_CLOSED   2
#define READABLESTREAM_STATE_ERRORED  4
#define READABLESTREAM_IS_DISTURBED   8

#define READABLESTREAM_SLOT_CONTROLLER   0
#define READABLESTREAM_SLOT_READER       1
#define READABLESTREAM_SLOT_STATE        2
#define READABLESTREAM_SLOT_STORED_ERROR 3

#define READABLESTREAMREADER_SLOT_CLOSED_PROMISE        0
#define READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM 1
#define READABLESTREAMREADER_SLOT_REQUESTS              2

#define READABLESTREAMCONTROLLER_FLAG_STARTED         0x1
#define READABLESTREAMCONTROLLER_FLAG_PULLING         0x2
#define READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN      0x4
#define READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED 0x8

#define READABLESTREAMCONTROLLER_FLAGS(controller)\
UnsafeGetInt32FromReservedSlot(controller, READABLESTREAMCONTROLLER_SLOT_FLAGS)

#define SET_READABLESTREAMCONTROLLER_FLAGS(controller, flags)\
UnsafeSetReservedSlot(controller, READABLESTREAMCONTROLLER_SLOT_FLAGS,\
                      UnsafeGetInt32FromReservedSlot(controller,\
                                                     READABLESTREAMCONTROLLER_SLOT_FLAGS) |\
                      (flags))

#define UNSET_READABLESTREAMCONTROLLER_FLAGS(controller, flags)\
UnsafeSetReservedSlot(controller, READABLESTREAMCONTROLLER_SLOT_FLAGS,\
                      UnsafeGetInt32FromReservedSlot(controller,\
                                                     READABLESTREAMCONTROLLER_SLOT_FLAGS) &\
                      ~(flags))

// ReadableStreamDefaultController and ReadableByteStreamController are both
// queue containers and must have these slots at identical offsets.
#define QUEUE_CONTAINER_SLOT_QUEUE      0
#define QUEUE_CONTAINER_SLOT_TOTAL_SIZE 1

// These three slots are identical between the two types of ReadableStream
// controllers.
// The first two slots are reserved for use as queue container.
#define READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM 2
#define READABLESTREAMCONTROLLER_SLOT_UNDERLYING_SOURCE 3
#define READABLESTREAMCONTROLLER_SLOT_STRATEGY_HWM      4
#define READABLESTREAMCONTROLLER_SLOT_FLAGS             5

#define READABLESTREAMDEFAULTCONTROLLER_SLOT_STRATEGY_SIZE          6

#define READABLEBYTESTREAMCONTROLLER_SLOT_BYOB_REQUEST              6
#define READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS        7
#define READABLEBYTESTREAMCONTROLLER_SLOT_AUTO_ALLOCATE_CHUNK_SIZE  8

#define READABLESTREAMBYOBREQUEST_SLOT_ASSOCIATED_READABLE_BYTESTREAM_CONTROLLER 0
#define READABLESTREAMBYOBREQUEST_SLOT_VIEW                                      1

#endif // builtin_StreamDefines_h
