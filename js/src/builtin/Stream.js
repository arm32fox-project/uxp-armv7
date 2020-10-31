/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Streams spec, 3.2.3.
function ReadableStream(underlyingSource = {}, {size, highWaterMark} = {}) {
  if (!IsObject(this) || !IsReadableStream(this))
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream", "ctor", typeof this);

  // Step 1: Set this.[[state]] to "readable".
  // Step 3: Set this.[[disturbed]] to false.
  UnsafeSetReservedSlot(this, READABLESTREAM_SLOT_STATE, READABLESTREAM_STATE_READABLE);

  // Step 2: Set this.[[reader]] and this.[[storedError]] to undefined (implicit).
  // Step 4: Set this.[[readableStreamController]] to undefined (implicit).

  // Step 5: Let type be ? GetV(underlyingSource, "type").
  let type = underlyingSource.type;

  // Step 6: Let typeString be ? ToString(type).
  // Omitted because this happens in the comparison in step 7.

  // Step 7: If typeString is "bytes",
  if (type === "bytes") {
    // Step a: If highWaterMark is undefined, let highWaterMark be 0.
    if (highWaterMark === undefined)
      highWaterMark = 0;

    // Step b: Set this.[[readableStreamController]] to
    //         ? Construct(ReadableByteStreamController, « this, underlyingSource, highWaterMark »).
    let ReadableByteStreamControllerCtor = GetBuiltinConstructor("ReadableByteStreamController");
    UnsafeSetReservedSlot(this, READABLESTREAM_SLOT_CONTROLLER,
                          new ReadableByteStreamControllerCtor(this,
                                                               underlyingSource,
                                                               highWaterMark));
  } else if (type === undefined) {
    // Step 8: Otherwise, if type is undefined,
    // Step a: If highWaterMark is undefined, let highWaterMark be 1.
    if (highWaterMark === undefined)
      highWaterMark = 1;

    // Step b: Set this.[[readableStreamController]] to
    //         ? Construct(ReadableStreamDefaultController, « this, underlyingSource, size, highWaterMark »).
    let ReadableStreamDefaultControllerCtor = GetBuiltinConstructor("ReadableStreamDefaultController");
    let controller = new ReadableStreamDefaultControllerCtor(this, underlyingSource,
                                                             size, highWaterMark);
    UnsafeSetReservedSlot(this, READABLESTREAM_SLOT_CONTROLLER, controller);
  } else {
    // Step 9: Otherwise, throw a RangeError exception.
    ThrowRangeError(JSMSG_READABLESTREAM_UNDERLYINGSOURCE_TYPE_WRONG);
  }
}

// Streams spec, 3.2.4.1. get locked
function ReadableStream_locked() {
  // Step 1: If ! IsReadableStream(this) is false, throw a TypeError exception.
  if (!IsObject(this) || !IsReadableStream(this))
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream", "locked", typeof this);

  // Step 2: Return ! IsReadableStreamLocked(this).
  return IsReadableStreamLocked(this);
}

// Streams spec, 3.2.4.2. cancel ( reason )
function ReadableStream_cancel(reason) {
  // Step 1: If ! IsReadableStream(this) is false, return a promise rejected
  //         with a TypeError exception.
  if (!IsObject(this) || !IsReadableStream(this)) {
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream",
                                               "cancel", typeof this));
  }

  // Step 2: If ! IsReadableStreamLocked(this) is true, return a promise
  //         rejected with a TypeError exception.
  if (IsReadableStreamLocked(this))
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_READABLESTREAM_NOT_LOCKED, "cancel"));

  // Step 3: Return ! ReadableStreamCancel(this, reason).
  return ReadableStreamCancel(this, reason);
}

// Streams spec, 3.2.4.3. getReader()
function ReadableStream_getReader({ mode } = {}) {
  // Step 1: If ! IsReadableStream(this) is false, throw a TypeError exception.
  if (!IsObject(this) || !IsReadableStream(this))
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream", "getReader", typeof this);

  // Step 2: If mode is "byob", return ? AcquireReadableStreamBYOBReader(this).
  if (mode === "byob")
    return AcquireReadableStreamBYOBReader(this);

  // Step 3: If mode is undefined, return
  //         ? AcquireReadableStreamDefaultReader(this).
  if (mode === undefined)
    return AcquireReadableStreamDefaultReader(this);

  ThrowRangeError(JSMSG_READABLESTREAM_INVALID_READER_MODE);
}

// Streams spec, 3.2.4.4. pipeThrough({ writable, readable }, options)
function ReadableStream_pipeThrough({ writable, readable }, options) {
  ThrowTypeError(JSMSG_READABLESTREAM_METHOD_NOT_IMPLEMENTED, "pipeThrough");
  // // Step 1: Perform ? Invoke(this, "pipeTo", « writable, options »).
  // callContentFunction("pipeTo", this, writable, options);

  // // Step 2: Return readable.
  // return readable;
}

// Streams spec, 3.2.4.5. pipeTo(dest, { preventClose, preventAbort, preventCancel } = {})
// TODO: Unimplemented since spec is not complete yet.
function ReadableStream_pipeTo(dest, { preventClose, preventAbort, preventCancel } = {}) {
  ThrowTypeError(JSMSG_READABLESTREAM_METHOD_NOT_IMPLEMENTED, "pipeTo");
}

// Streams spec, 3.2.4.6. tee()
function ReadableStream_tee() {
  // Step 1: If ! IsReadableStream(this) is false, throw a TypeError exception
  if (!IsObject(this) || !IsReadableStream(this))
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream", "tee", typeof this);

  // Step 2: Let branches be ? ReadableStreamTee(this, false).
  let branches = ReadableStreamTee(this, false);

  // Step 3: Return ! CreateArrayFromList(branches).
  assert(branches.length == 2, "ReadableStreamTee() must return two branches.");
  return branches;
}

// Streams spec, 3.3.1. AcquireReadableStreamBYOBReader ( stream )
function AcquireReadableStreamBYOBReader(stream) {
  // Step 1: Return ? Construct(ReadableStreamBYOBReader, « stream »)
  let ReadableStreamBYOBReaderCtor = GetBuiltinConstructor("ReadableStreamBYOBReader");
  return new ReadableStreamBYOBReaderCtor(stream);
}

// Streams spec, 3.3.2. AcquireReadableStreamDefaultReader ( stream )
function AcquireReadableStreamDefaultReader(stream) {
  // Step 1: Return ? Construct(ReadableStreamDefaultReader, « stream »)
  let ReadableStreamDefaultReaderCtor = GetBuiltinConstructor("ReadableStreamDefaultReader");
  return new ReadableStreamDefaultReaderCtor(stream);
}

// Streams spec, 3.3.3. IsReadableStream ( x )
// Implemented via intrinsic_isInstanceOfBuiltin<ReadableStream>()

// Streams spec, 3.3.4. IsReadableStreamDisturbed ( stream )
function IsReadableStreamDisturbed(stream) {
  // Step 1: Assert: ! IsReadableStream(stream) is true.
  assert(IsReadableStreamDefaultController(this), "IsReadableStream(stream)");

  // Step 2: Return stream.[[disturbed]].
  return UnsafeGetBooleanFromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_IS_DISTURBED;
}

// Streams spec, 3.3.5. IsReadableStreamLocked ( stream )
function IsReadableStreamLocked(stream) {
  // Step 1: Assert: ! IsReadableStream(stream) is true.
  assert(IsReadableStream(stream), "IsReadableStream(stream)");

  // Step 2: If stream.[[reader]] is undefined, return false.
  // Step 3: Return true.
  return UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_READER) !== undefined;
}

// Streams spec, 3.3.6. ReadableStreamTee ( stream, shouldClone )
// TODO: This could be re-designed to use a class instead of closures
function ReadableStreamTee(stream, shouldClone) {
  // Step 1: Assert: ! IsReadableStream(stream) is true.
  assert(IsReadableStream(stream), "IsReadableStream(stream)");

  // Step 2: Assert: Type(shouldClone) is Boolean.
  assert(typeof shouldClone === "boolean", "Type(shouldClone) is Boolean");

  // Step 3: Let reader be ? AcquireReadableStreamDefaultReader(stream).
  let reader = AcquireReadableStreamDefaultReader(stream);

  // Step 4: Let teeState be Record {[[closedOrErrored]]: false, [[canceled1]]: false, [[canceled2]]: false, [[reason1]]: undefined, [[reason2]]: undefined, [[promise]]: a new promise}.
  let teeState = {
    __proto__: null,
    closedOrErrored: false,
    canceled1: false,
    canceled2: false,
    reason1: undefined,
    reason2: undefined,
    promise: CreatePendingPromise()
  }

  let branch1;
  let branch2;

  // Step 5: Let pull be a new ReadableStreamTee pull function.
  // Step 6: Set pull.[[reader]] to reader, pull.[[teeState]] to teeState, and
  //         pull.[[shouldClone]] to shouldClone.
  let pull = () => {
    // ReadableStreamTee pull function
    // Step 1: Let reader be F.[[reader]], branch1 be F.[[branch1]],
    //         branch2 be F.[[branch2]], teeState be F.[[teeState]], and
    //         shouldClone be F.[[shouldClone]].
    // Implemented via closure.

    // Step 2: Return the result of transforming
    //         ! ReadableStreamDefaultReaderRead(reader) by a fulfillment
    //         handler which takes the argument result and performs the
    //         following steps:
    let readPromise = ReadableStreamDefaultReaderRead(reader);
    return CallOriginalPromiseThen(readPromise, result => {
      // Step a: Assert: Type(result) is Object.
      assert(IsObject(result), "Read result should be an object");

      // Step b: Let value be ? Get(result, "value").
      let value = result.value;

      // Step c: Let done be ? Get(result, "done").
      let done = result.done;

      // Step d: Assert: Type(done) is Boolean.
      assert(typeof done === "boolean", "Read result.done should be a boolean");

      // Step e: If done is true and teeState.[[closedOrErrored]] is false,
      if (done && !teeState.closedOrErrored) {
        // Step i: If teeState.[[canceled1]] is false,
        if (!teeState.canceled1) {

          // Step 1: Perform ! ReadableStreamDefaultControllerClose(branch1).
          ReadableStreamDefaultControllerClose(branch1);
        }

        // Step ii: If teeState.[[canceled2]] is false,
        if (!teeState.canceled2) {

          // Step 1: Perform ! ReadableStreamDefaultControllerClose(branch2).
          ReadableStreamDefaultControllerClose(branch2);
        }

        // Step iii: Set teeState.[[closedOrErrored]] to true.
        teeState.closedOrErrored = true;
      }

      // Step f: If teeState.[[closedOrErrored]] is true, return.
      if (teeState.closedOrErrored)
        return;

      // Step g: If teeState.[[canceled1]] is false,
      if (!teeState.canceled1) {
        // Step i: Let value1 be value.
        let value1 = value;

        // Step ii: If shouldClone is true, set value1 to ? StructuredClone(value).
        // No way to trigger StructuredClone() and spec always passes false
        // at the moment.
        assert(!shouldClone, "tee(shouldClone=true) should not be exposed");

        // Step iii: Perform ? ReadableStreamDefaultControllerEnqueue(branch1, value1).
        ReadableStreamDefaultControllerEnqueue(branch1, value1);
      }

      // Step h: If teeState.[[canceled2]] is false,
      if (!teeState.canceled2) {
        // Step i: Let value2 be value.
        let value2 = value;

        // Step ii: If shouldClone is true, set value2 to ? StructuredClone(value).
        // No way to trigger StructuredClone() and spec always passes false
        // at the moment.
        assert(!shouldClone, "tee(shouldClone=true) should not be exposed");

        // Step iii: Perform ? ReadableStreamDefaultControllerEnqueue(branch1, value2).
        ReadableStreamDefaultControllerEnqueue(branch2, value2);
      }
    });
  };

  // Step 7: Let cancel1 be a new ReadableStreamTee branch 1 cancel function.
  // Step 8: Set cancel1.[[stream]] to stream and cancel1.[[teeState]] to
  //         teeState.
  let cancel1 = (reason) => {
    // ReadableStreamTee cancel function
    // Step 1: Let stream be F.[[stream]] and teeState be F.[[teeState]].
    // Implemented via closure

    // Step 2: Set teeState.[[canceled1]] to true.
    teeState.canceled1 = true;

    // Step 3: Set teeState.[[reason1]] to reason.
    teeState.reason1 = reason;

    // Step 4: If teeState.[[canceled2]] is true,
    if (teeState.canceled2) {
      // Step a: Let compositeReason be
      //         ! CreateArrayFromList(« teeState.[[reason1]], teeState.[[reason2]] »).
      let compositeReason = [ teeState.reason1, teeState.reason2 ];

      // Step b: Let cancelResult be ! ReadableStreamCancel(stream, compositeReason).
      let cancelResult = ReadableStreamCancel(stream, compositeReason);

      // Step c: Resolve teeState.[[promise]] with cancelResult.
      ResolvePromise(teeState.promise, cancelResult);
    }

    // Step 5: Return teeState.[[promise]].
    return teeState.promise;
  };

  // Step 9: Let cancel2 be a new ReadableStreamTee branch 2 cancel function.
  // Step 10: Set cancel2.[[stream]] to stream and cancel2.[[teeState]] to
  //          teeState.
  let cancel2 = (reason) => {
    // ReadableStreamTee cancel function
    // Step 1: Let stream be F.[[stream]] and teeState be F.[[teeState]].
    // Implemented via closure

    // Step 2: Set teeState.[[canceled2]] to true.
    teeState.canceled2 = true;

    // Step 3: Set teeState.[[reason2]] to reason.
    teeState.reason2 = reason;

    // Step 4: If teeState.[[canceled1]] is true,
    if (teeState.canceled1) {
      // Step a: Let compositeReason be
      //         ! CreateArrayFromList(« teeState.[[reason1]], teeState.[[reason2]] »).
      let compositeReason = [ teeState.reason1, teeState.reason2 ];

      // Step b: Let cancelResult be ! ReadableStreamCancel(stream, compositeReason).
      let cancelResult = ReadableStreamCancel(stream, compositeReason);

      // Step c: Resolve teeState.[[promise]] with cancelResult.
      ResolvePromise(teeState.promise, cancelResult);
    }

    // Step 5: Return teeState.[[promise]].
    return teeState.promise;
  };

  // Step 11: Let underlyingSource1 be ! ObjectCreate(%ObjectPrototype%).
  // Step 12: Perform ! CreateDataProperty(underlyingSource1, "pull", pull).
  // Step 13: Perform ! CreateDataProperty(underlyingSource1, "cancel", cancel1).
  let underlyingSource1 = {
    pull,
    cancel: cancel1
  };

  // Step 14: Let branch1Stream be ! Construct(ReadableStream, underlyingSource1).
  let ReadableStreamCtor = GetBuiltinConstructor("ReadableStream");
  let branch1Stream = new ReadableStreamCtor(underlyingSource1);

  // Step 15: Let underlyingSource2 be ! ObjectCreate(%ObjectPrototype%).
  // Step 16: Perform ! CreateDataProperty(underlyingSource2, "pull", pull).
  // Step 17: Perform ! CreateDataProperty(underlyingSource2, "cancel", cancel2).
  let underlyingSource2 = {
    pull,
    cancel: cancel2
  };

  // Step 18: Let branch2Stream be ! Construct(ReadableStream, underlyingSource2).
  let branch2Stream = new ReadableStreamCtor(underlyingSource2);

  // Step 19: Set pull.[[branch1]] to branch1Stream.[[readableStreamController]].
  branch1 = UnsafeGetObjectFromReservedSlot(branch1Stream, READABLESTREAM_SLOT_CONTROLLER);

  // Step 20: Set pull.[[branch2]] to branch2Stream.[[readableStreamController]].
  branch2 = UnsafeGetObjectFromReservedSlot(branch2Stream, READABLESTREAM_SLOT_CONTROLLER);

  // Step 21: Upon rejection of reader.[[closedPromise]] with reason r,
  let promise = UnsafeGetObjectFromReservedSlot(reader, READABLESTREAMREADER_SLOT_CLOSED_PROMISE);
  AddPromiseReactions(promise, undefined, reason => {
    // Step a: If teeState.[[closedOrErrored]] is true, return.
    if (teeState.closedOrErrored)
      return;

    // Step b: Perform ! ReadableStreamDefaultControllerError(pull.[[branch1]], r).
    ReadableStreamDefaultControllerError(branch1, reason);

    // Step c: Perform ! ReadableStreamDefaultControllerError(pull.[[branch2]], r).
    ReadableStreamDefaultControllerError(branch2, reason);

    // Step d: Set teeState.[[closedOrErrored]] to true.
    teeState.closedOrErrored = true;
  });

  // Step 22: Return « branch1, branch2 ».
  // Changed to return an array that ReadableStream_tee can just return.
  return [branch1Stream, branch2Stream];
}

// Streams spec, 3.4.1. ReadableStreamAddReadIntoRequest ( stream )
function ReadableStreamAddReadIntoRequest(stream) {
  assert(IsReadableStream(stream),
         "ReadableStreamAddReadIntoRequest() must operate on a stream");

  // Step 1: Assert: ! IsReadableStreamBYOBReader(stream.[[reader]]) is true.
  let reader = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_READER);
  assert(IsReadableStreamBYOBReader(reader),
         "ReadableStreamAddReadIntoRequest() must operate on a ReadableStreamBYOBReader");

  // Step 2: Assert: stream.[[state]] is "readable" or "closed".
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         (READABLESTREAM_STATE_READABLE | READABLESTREAM_STATE_CLOSED),
         "Invalid ReadableStream state");

  // Step 3: Let promise be a new promise.
  let promise = CreatePendingPromise();

  // Step 4: Let readIntoRequest be Record {[[promise]]: promise}.
  let readIntoRequest = {__proto__: null, promise};

  // Step 5: Append readIntoRequest as the last element of stream.[[reader]].[[readIntoRequests]].
  let readIntoRequests = UnsafeGetObjectFromReservedSlot(reader,
                                                         READABLESTREAMREADER_SLOT_REQUESTS);
  ArrayStaticPush(readIntoRequests, readIntoRequest);

  // Step 6: Return promise.
  return promise;
}

// Streams spec, 3.4.2. ReadableStreamAddReadRequest ( stream )
function ReadableStreamAddReadRequest(stream) {
  assert(IsReadableStream(stream),
         "ReadableStreamAddReadRequest() must operate on a stream");

  // Step 1: Assert: ! IsReadableStreamDefaultReader(stream.[[reader]]) is true.
  let reader = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_READER);
  assert(IsReadableStreamDefaultReader(reader),
         "ReadableStreamAddReadRequest() must operate on a ReadableStreamDefaultReader");

  // Step 2: Assert: stream.[[state]] is "readable".
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_STATE_READABLE, "Invalid ReadableStream state");

  // Step 3: Let promise be a new promise.
  let promise = CreatePendingPromise();

  // Step 4: Let readIntoRequest be Record {[[promise]]: promise}.
  let readRequest = {__proto__: null, promise};

  // Step 5: Append readRequest as the last element of stream.[[reader]].[[readRequests]].
  let readRequests = UnsafeGetObjectFromReservedSlot(reader,
                                                     READABLESTREAMREADER_SLOT_REQUESTS);
  ArrayStaticPush(readRequests, readRequest);

  // Step 6: Return promise.
  return promise;
}

// Streams spec, 3.4.3. ReadableStreamCancel ( stream, reason )
function ReadableStreamCancel(stream, reason) {
  // Step 1: Set stream.[[disturbed]] to true.
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  state |= READABLESTREAM_IS_DISTURBED;
  UnsafeSetReservedSlot(stream, READABLESTREAM_SLOT_STATE, state);

  // Step 2: If stream.[[state]] is "closed", return a new promise resolved
  //         with undefined.
  if (state & READABLESTREAM_STATE_CLOSED)
    return CreatePromiseResolvedWith(undefined);

  // Step 3: If stream.[[state]] is "errored", return a new promise rejected
  //         with stream.[[storedError]].
  if (state & READABLESTREAM_STATE_ERRORED) {
    let storedError = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_STORED_ERROR);
    return CreatePromiseRejectedWith(storedError);
  }

  // Step 4: Perform ! ReadableStreamClose(stream).
  ReadableStreamClose(stream);

  // Step 5: Let sourceCancelPromise be
  //         ! stream.[[readableStreamController]].[[Cancel]](reason).
  // This part is a bit annoying: we don't actually want to store the `Cancel`
  // method in a slot, so we have to check the type of the controller and call
  // the right method manually.
  let controller = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_CONTROLLER);
  let CancelMethod = IsReadableStreamDefaultController(controller)
                     ? ReadableStreamDefaultController_cancel
                     : ReadableByteStreamController_cancel;
  let sourceCancelPromise = callFunction(CancelMethod, controller, reason);

  // Step 6: Return the result of transforming sourceCancelPromise by a
  //         fulfillment handler that returns undefined.
  return CallOriginalPromiseThen(sourceCancelPromise, ReturnUndefined);
}

function ReturnUndefined() {
}

// Step 3.4.4. ReadableStreamClose ( stream )
function ReadableStreamClose(stream) {
  assert(IsReadableStream(stream), "ReadableStreamClose() must operate on a ReadableStream");

  // Step 1: Assert: stream.[[state]] is "readable".
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  assert(state & READABLESTREAM_STATE_READABLE,
         "ReadableStreamClose() must operate on readable ReadableStreams");

  // Step 2: Set stream.[[state]] to "closed".
  UnsafeSetReservedSlot(stream, READABLESTREAM_SLOT_STATE,
                        (state & READABLESTREAM_IS_DISTURBED) | READABLESTREAM_STATE_CLOSED);

  // Step 3: Let reader be stream.[[reader]].
  let reader = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_READER);

  // Step 4: If reader is undefined, return.
  if (reader === undefined)
    return;

  // Step 5: If ! IsReadableStreamDefaultReader(reader) is true,
  if (IsReadableStreamDefaultReader(reader)) {
    // Step a: Repeat for each readRequest that is an element of
    //         reader.[[readRequests]],
    let readRequests = UnsafeGetObjectFromReservedSlot(reader, READABLESTREAMREADER_SLOT_REQUESTS);
    let len = readRequests.length;
    for (let i = 0; i < len; i++) {
      // Step i: Resolve readRequest.[[promise]] with
      //         ! CreateIterResultObject(undefined, true).
      let readRequest = readRequests[i];
      ResolvePromise(readRequest.promise, {value: undefined, done: true});
    }

    // Step b: Set reader.[[readRequests]] to an empty List.
    UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_REQUESTS, new List());
  }

  // Step 6: Resolve reader.[[closedPromise]] with undefined.
  let closedPromise = UnsafeGetObjectFromReservedSlot(reader,
                                                      READABLESTREAMREADER_SLOT_CLOSED_PROMISE);
  ResolvePromise(closedPromise, undefined);

  // Step 7: Return (implicit).
}

// Streams spec, 3.4.5. ReadableStreamError ( stream, e )
function ReadableStreamError(stream, e) {
  // Step 1: Assert: ! IsReadableStream(stream) is true.
  assert(IsReadableStream(stream), "ReadableStreamError() must operate on a ReadableStream");

  // Step 2: Assert: stream.[[state]] is "readable".
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  assert(state & READABLESTREAM_STATE_READABLE,
         "ReadableStreamError() must operate on readable ReadableStreams");

  // Step 3: Set stream.[[state]] to "errored".
  UnsafeSetReservedSlot(stream, READABLESTREAM_SLOT_STATE,
                        (state & READABLESTREAM_IS_DISTURBED) | READABLESTREAM_STATE_ERRORED);

  // Step 4: Set stream.[[storedError]] to e.
  UnsafeSetReservedSlot(stream, READABLESTREAM_SLOT_STORED_ERROR, e);

  // Step 5: Let reader be stream.[[reader]].
  let reader = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_READER);

  // Step 6: If reader is undefined, return.
  if (reader === undefined)
    return;

  // Step 7: If ! IsReadableStreamDefaultReader(reader) is true,
  if (IsReadableStreamDefaultReader(reader)) {
    // Step a: Repeat for each readRequest that is an element of
    //         reader.[[readRequests]],
    let readRequests = UnsafeGetObjectFromReservedSlot(reader, READABLESTREAMREADER_SLOT_REQUESTS);
    let len = readRequests.length;
    for (let i = 0; i < len; i++) {
      // Step i: Reject readRequest.[[promise]] with e.
      let readRequest = readRequests[i];
      RejectPromise(readRequest.promise, e);
    }

    // Step b: Set reader.[[readRequests]] to a new empty List.
    UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_REQUESTS, new List());
  } else {
    // Step 8: Otherwise,
    // Step a: Assert: ! IsReadableStreamBYOBReader(reader).
    assert(IsReadableStreamBYOBReader(reader), "Non-default reader must be a BYOB reader");

    // Step b: Repeat for each readIntoRequest that is an element of
    //         reader.[[readIntoRequests]],
    let readIntoRequests = UnsafeGetObjectFromReservedSlot(reader,
                                                           READABLESTREAMREADER_SLOT_REQUESTS);
    let len = readIntoRequests.length;
    for (let i = 0; i < len; i++) {
      // Step i: Reject readIntoRequest.[[promise]] with e.
      let readIntoRequest = readIntoRequests[i];
      RejectPromise(readIntoRequest.promise, e);
    }

    // Step b: Set reader.[[readIntoRequests]] to a new empty List.
    UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_REQUESTS, new List());
  }

  // Step 9: Reject reader.[[closedPromise]] with e.
  let closedPromise = UnsafeGetObjectFromReservedSlot(reader,
                                                      READABLESTREAMREADER_SLOT_CLOSED_PROMISE);
  RejectPromise(closedPromise, e);
}

// Streams spec, 3.4.6. ReadableStreamFulfillReadIntoRequest( stream, chunk, done )
function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
  assert(IsReadableStream(stream),
         "ReadableStreamFulfillReadIntoRequest() must operate on a ReadableStream");

  // Step 1: Let reader be stream.[[reader]].
  let reader = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_READER);

  assert(IsReadableStreamBYOBReader(reader),
         "ReadableStreamFulfillReadIntoRequest() must operate on a ReadableStreamBYOBReader");

  // Step 2: Let readIntoRequest be the first element of
  //         reader.[[readIntoRequests]].
  // Step 3: Remove readIntoRequest from reader.[[readIntoRequests]], shifting
  //         all other elements downward (so that the second becomes the first,
  //         and so on).
  let readIntoRequests = UnsafeGetObjectFromReservedSlot(reader,
                                                         READABLESTREAMREADER_SLOT_REQUESTS);
  let readIntoRequest = ArrayStaticShift(readIntoRequests);

  // Step 4: Resolve readIntoRequest.[[promise]] with
  //         ! CreateIterResultObject(chunk, done).
  ResolvePromise(readIntoRequest.promise, {value: chunk, done});
}

// Streams spec, 3.4.7. ReadableStreamFulfillReadRequest ( stream, chunk, done)
function ReadableStreamFulfillReadRequest(stream, chunk, done) {
  assert(IsReadableStream(stream),
         "ReadableStreamFulfillReadRequest() must operate on a ReadableStream");

  // Step 1: Let reader be stream.[[reader]].
  let reader = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_READER);

  assert(IsReadableStreamDefaultReader(reader),
         "ReadableStreamFulfillReadRequest() must operate on a ReadableStreamDefaultReader");

  // Step 2: Let readRequest be the first element of reader.[[readRequests]].
  // Step 3: Remove readRequest from reader.[[readRequests]], shifting all other
  //         elements downward (so that the second becomes the first, and so on).
  let readRequests = UnsafeGetObjectFromReservedSlot(reader, READABLESTREAMREADER_SLOT_REQUESTS);
  let readRequest = ArrayStaticShift(readRequests);

  // Step 4: Resolve readRequest.[[promise]] with
  //         ! CreateIterResultObject(chunk, done).
  ResolvePromise(readRequest.promise, {value: chunk, done});
}

// Streams spec 3.4.8. ReadableStreamGetNumReadIntoRequests ( stream )
function ReadableStreamGetNumReadIntoRequests(stream) {
  assert(IsReadableStream(stream),
         "ReadableStreamGetNumReadIntoRequests must operate on a ReadableStream");

  let reader = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_READER);

  assert(IsReadableStreamBYOBReader(reader),
         "ReadableStreamGetNumReadIntoRequests must operate on a ReadableStreamBYOBReader");

  let readIntoRequests = UnsafeGetObjectFromReservedSlot(reader,
                                                         READABLESTREAMREADER_SLOT_REQUESTS);

  // Step 1: Return the number of elements in
  //         stream.[[reader]].[[readIntoRequests]].
  return readIntoRequests.length;
}

// Streams spec 3.4.9. ReadableStreamGetNumReadRequests ( stream )
function ReadableStreamGetNumReadRequests(stream) {
  assert(IsReadableStream(stream),
         "ReadableStreamGetNumReadRequests must operate on a ReadableStream");

  let reader = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_READER);

  assert(IsReadableStreamDefaultReader(reader),
         "ReadableStreamGetNumReadRequests must operate on a ReadableStreamDefaultReader");

  let readRequests = UnsafeGetObjectFromReservedSlot(reader, READABLESTREAMREADER_SLOT_REQUESTS);

  // Step 1: Return the number of elements in
  //         stream.[[reader]].[[readRequests]].
  return readRequests.length;
}

// Stream spec 3.4.10. ReadableStreamHasBYOBReader ( stream )
function ReadableStreamHasBYOBReader(stream) {
  assert(IsReadableStream(stream),
         "ReadableStreamHasBYOBReader must operate on a ReadableStream");

  // Step 1: Let reader be stream.[[reader]].
  let reader = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_READER);

  // Step 2: If reader is undefined, return false.
  if (reader === undefined)
    return false;

  // Step 3: If ! IsReadableStreamBYOBReader(reader) is false, return false.
  // Step 4: Return true.
  return IsReadableStreamBYOBReader(reader);
}

// Streap spec 3.4.11. ReadableStreamHasDefaultReader ( stream )
function ReadableStreamHasDefaultReader(stream) {
  assert(IsReadableStream(stream),
         "ReadableStreamHasDefaultReader must operate on a ReadableStream");

  // Step 1: Let reader be stream.[[reader]].
  let reader = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_READER);

  // Step 2: If reader is undefined, return false.
  if (reader === undefined)
    return false;

  // Step 3: If ! IsReadableStreamBYOBReader(reader) is false, return false.
  // Step 4: Return true.
  return IsReadableStreamDefaultReader(reader);
}

// Stream spec, 3.5.3. new ReadableStreamDefaultReader ( stream )
function ReadableStreamDefaultReader(stream) {
  if (!IsReadableStreamDefaultReader(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamDefaultReader",
                   "ctor", typeof this);
  }

  // Step 1: If ! IsReadableStream(stream) is false, throw a TypeError exception.
  if (!IsObject(stream) || !IsReadableStream(stream)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream",
                   "ReadableStreamDefaultReader", typeof stream);
  }

  // Step 2: If ! IsReadableStreamLocked(stream) is true, throw a TypeError
  //         exception.
  if (IsReadableStreamLocked(stream))
    ThrowTypeError(JSMSG_READABLESTREAM_LOCKED);

  // Step 3: Perform ! ReadableStreamReaderGenericInitialize(this, stream).
  ReadableStreamReaderGenericInitialize(this, stream);

  // Step 4: Set this.[[readRequests]] to a new empty List.
  UnsafeSetReservedSlot(this, READABLESTREAMREADER_SLOT_REQUESTS, new List());
}

// Streams spec, 3.5.4.1 get closed
function ReadableStreamDefaultReader_closed() {
  // Step 1: If ! IsReadableStreamDefaultReader(this) is false, return a promise
  //         rejected with a TypeError exception.
  if (!IsReadableStreamDefaultReader(this)) {
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_INCOMPATIBLE_PROTO,
                                                  "ReadableStreamDefaultReader",
                                                  "closed", typeof this));
  }

  // Step 2: Return this.[[closedPromise]].
  return UnsafeGetObjectFromReservedSlot(this, READABLESTREAMREADER_SLOT_CLOSED_PROMISE);
}

// Streams spec, 3.5.4.2. cancel ( reason )
function ReadableStreamDefaultReader_cancel(reason) {
  // Step 1: If ! IsReadableStreamDefaultReader(this) is false, return a promise
  //         rejected with a TypeError exception.
  if (!IsReadableStreamDefaultReader(this)) {
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_INCOMPATIBLE_PROTO,
                                                  "ReadableStreamDefaultReader",
                                                  "cancel", typeof this));
  }

  // Step 2: If this.[[ownerReadableStream]] is undefined, return a promise
  //         rejected with a TypeError exception.
  let ownerReadableStream = UnsafeGetReservedSlot(this,
                                                  READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);
  if (ownerReadableStream === undefined)
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_READABLESTREAMREADER_NOT_OWNED, "cancel"));

  // Step 3: Return ! ReadableStreamReaderGenericCancel(this, reason).
  return ReadableStreamReaderGenericCancel(this, reason);
}

// Streams spec, 3.5.4.3 read ( )
function ReadableStreamDefaultReader_read() {
  // Step 1: If ! IsReadableStreamDefaultReader(this) is false, return a promise
  //         rejected with a TypeError exception.
  if (!IsReadableStreamDefaultReader(this)) {
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_INCOMPATIBLE_PROTO,
                                                  "ReadableStreamDefaultReader",
                                                  "read", typeof this));
  }

  // Step 2: If this.[[ownerReadableStream]] is undefined, return a promise
  //         rejected with a TypeError exception.
  let ownerReadableStream = UnsafeGetReservedSlot(this,
                                                  READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);
  if (ownerReadableStream === undefined)
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_READABLESTREAMREADER_NOT_OWNED, "read"));

  // Step 3: Return ! ReadableStreamDefaultReaderRead(this).
  return ReadableStreamDefaultReaderRead(this);
}

// Streams spec, 3.5.4.4. releaseLock ( )
function ReadableStreamDefaultReader_releaseLock() {
  // Step 1: If ! IsReadableStreamDefaultReader(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableStreamDefaultReader(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamDefaultReader",
                   "releaseLock", typeof this);
  }

  // Step 2: If this.[[ownerReadableStream]] is undefined, return.
  let ownerReadableStream = UnsafeGetReservedSlot(this,
                                                  READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);
  if (ownerReadableStream === undefined)
    return;

  // Step 3: If this.[[readRequests]] is not empty, throw a TypeError exception.
  let readRequests = UnsafeGetObjectFromReservedSlot(this, READABLESTREAMREADER_SLOT_REQUESTS);
  if (readRequests.length !== 0)
    ThrowTypeError(JSMSG_READABLESTREAMREADER_NOT_EMPTY, "releaseLock");

  // Step 4: Perform ! ReadableStreamReaderGenericRelease(this).
  ReadableStreamReaderGenericRelease(this);
}

// Streams spec, 3.6.3 new ReadableStreamBYOBReader ( stream )
function ReadableStreamBYOBReader(stream) {
  if (!IsReadableStreamBYOBReader(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamBYOBReader",
                   "ctor", typeof this);
  }

  // Step 1: If ! IsReadableStream(stream) is false, throw a TypeError exception.
  if (!IsObject(stream) || !IsReadableStream(stream)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream",
                   "ReadableStreamBYOBReader", typeof stream);
  }

  // Step 2: If ! IsReadableByteStreamController(stream.[[readableStreamController]])
  //         is false, throw a TypeError exception.
  let controller = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_CONTROLLER);
  if (!IsReadableByteStreamController(controller))
    ThrowTypeError(JSMSG_READABLESTREAM_NOT_BYTE_STREAM_CONTROLLER);

  // Step 3: If ! IsReadableStreamLocked(stream) is true, throw a TypeError
  //         exception.
  if (IsReadableStreamLocked(stream))
    ThrowTypeError(JSMSG_READABLESTREAM_LOCKED);

  // Step 4: Perform ! ReadableStreamReaderGenericInitialize(this, stream).
  ReadableStreamReaderGenericInitialize(this, stream);

  // Step 5: Set this.[[readIntoRequests]] to a new empty List.
  UnsafeSetReservedSlot(this, READABLESTREAMREADER_SLOT_REQUESTS, new List());
}

// Streams spec, 3.6.4.1 get closed
function ReadableStreamBYOBReader_closed() {
  // Step 1: If ! IsReadableStreamBYOBReader(this) is false, return a promise
  //         rejected with a TypeError exception.
  if (!IsReadableStreamBYOBReader(this)) {
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_INCOMPATIBLE_PROTO,
                                                  "ReadableStreamBYOBReader",
                                                  "closed", typeof this));
  }

  // Step 2: Return this.[[closedPromise]].
  return UnsafeGetObjectFromReservedSlot(this, READABLESTREAMREADER_SLOT_CLOSED_PROMISE);
}

// Streams spec, 3.6.4.2. cancel ( reason )
function ReadableStreamBYOBReader_cancel(reason) {
  // Step 1: If ! IsReadableStreamBYOBReader(this) is false, return a promise
  //         rejected with a TypeError exception.
  if (!IsReadableStreamBYOBReader(this)) {
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_INCOMPATIBLE_PROTO,
                                                  "ReadableStreamBYOBReader",
                                                  "cancel", typeof this));
  }

  // Step 2: If this.[[ownerReadableStream]] is undefined, return a promise
  //         rejected with a TypeError exception.
  let ownerReadableStream = UnsafeGetReservedSlot(this,
                                                  READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);
  if (ownerReadableStream === undefined)
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_READABLESTREAMREADER_NOT_OWNED, "cancel"));

  // Step 3: Return ! ReadableStreamReaderGenericCancel(this, reason).
  return ReadableStreamReaderGenericCancel(this, reason);
}

// Streams spec, 3.6.4.3. read ( view )
function ReadableStreamBYOBReader_read(view) {
  // Step 1: If ! IsReadableStreamBYOBReader(this) is false, return a promise
  //         rejected with a TypeError exception.
  if (!IsReadableStreamBYOBReader(this)) {
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_INCOMPATIBLE_PROTO,
                                                  "ReadableStreamBYOBReader",
                                                  "read", typeof this));
  }

  // Step 2: If this.[[ownerReadableStream]] is undefined, return a promise
  //         rejected with a TypeError exception.
  let ownerReadableStream = UnsafeGetReservedSlot(this,
                                                  READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);
  if (ownerReadableStream === undefined)
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_READABLESTREAMREADER_NOT_OWNED, "read"));

  // Step 3: If Type(view) is not Object, return a promise rejected with a
  //         TypeError exception.
  // Step 4: If view does not have a [[ViewedArrayBuffer]] internal slot,
  //         return a promise rejected with a TypeError exception.
  if (!IsObject(view) || !IsTypedArray(view)) {
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_NOT_EXPECTED_TYPE,
                                                  "ReadableStreamBYOBReader.read",
                                                  "Typed Array", typeof view));
  }

  // Step 5: If view.[[ByteLength]] is 0, return a promise rejected with a
  //         TypeError exception.
  // Note: It's ok to use the length in number of elements here because all we
  // want to know is whether it's < 0.
  if (TypedArrayLength(view) === 0)
    return CreatePromiseRejectedWith(GetTypeError(JSMSG_READABLESTREAMBYOBREADER_READ_EMPTY_VIEW));

  // Step 6: Return ! ReadableStreamBYOBReaderRead(this, view).
  return ReadableStreamBYOBReaderRead(this, view);
}

// Streams spec, 3.6.4.4. releaseLock ( )
function ReadableStreamBYOBReader_releaseLock() {
  // Step 1: If ! IsReadableStreamBYOBReader(this) is false, throw a TypeError
  //         exception.
  if (!IsReadableStreamBYOBReader(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamBYOBReader",
                   "releaseLock", typeof this);
  }

  // Step 2: If this.[[ownerReadableStream]] is undefined, return.
  let ownerReadableStream = UnsafeGetReservedSlot(this,
                                                  READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);
  if (ownerReadableStream === undefined)
    return;

  // Step 3: If this.[[readIntoRequests]] is not empty, throw a TypeError
  //         exception.
  let readIntoRequests = UnsafeGetObjectFromReservedSlot(this, READABLESTREAMREADER_SLOT_REQUESTS);
  if (readIntoRequests.length !== 0)
    ThrowTypeError(JSMSG_READABLESTREAMREADER_NOT_EMPTY, "releaseLock");

  // Step 4: Perform ! ReadableStreamReaderGenericRelease(this).
  ReadableStreamReaderGenericRelease(this);
}

// Streams spec, 3.7.1. IsReadableStreamDefaultReader ( x )
// Implemented via intrinsic_isInstanceOfBuiltin<ReadableStreamDefaultReader>()

// Streams spec, 3.7.2. IsReadableStreamBYOBReader ( x )
// Implemented via intrinsic_isInstanceOfBuiltin<ReadableStreamBYOBReader>()

// Streams spec, 3.7.3. ReadableStreamReaderGenericCancel ( reader, reason )
function ReadableStreamReaderGenericCancel(reader, reason) {
  assert(IsReadableStreamDefaultReader(reader) ||
         IsReadableStreamBYOBReader(reader), "must be either a default or byob reader");

  // Step 1: Let stream be reader.[[ownerReadableStream]].
  let stream = UnsafeGetReservedSlot(reader, READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);

  // Step 2: Assert: stream is not undefined.
  assert(stream !== undefined, "owning stream must be defined");

  // Step 3: Return ! ReadableStreamCancel(stream, reason).
  return ReadableStreamCancel(stream, reason);
}

// Streams spec, 3.7.4. ReadableStreamReaderGenericInitialize ( reader, stream )
function ReadableStreamReaderGenericInitialize(reader, stream) {
  assert(IsReadableStreamDefaultReader(reader) ||
         IsReadableStreamBYOBReader(reader), "must be either a default or byob reader");
  assert(IsReadableStream(stream), "must be initializing with a ReadableStream");

  // Step 1: Set reader.[[ownerReadableStream]] to stream.
  UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM, stream);

  // Step 2: Set stream.[[reader]] to reader.
  UnsafeSetReservedSlot(stream, READABLESTREAM_SLOT_READER, reader);

  // Step 3: If stream.[[state]] is "readable",
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (state & READABLESTREAM_STATE_READABLE) {
    // Step a: Set reader.[[closedPromise]] to a new promise.
    UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_CLOSED_PROMISE,
                          CreatePendingPromise());
  } else if (state & READABLESTREAM_STATE_CLOSED) {
    // Step 4: Otherwise
    // Step a: If stream.[[state]] is "closed",
    // Step i: Set reader.[[closedPromise]] to a new promise resolved with
    //         undefined.
    UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_CLOSED_PROMISE,
                          CreatePromiseResolvedWith(undefined));
  } else {
    // Step b: Otherwise,
    // Step i: Assert: stream.[[state]] is "errored".
    assert(state & READABLESTREAM_STATE_ERRORED, "must be errored if not readable or closed");

    // Step ii: Set reader.[[closedPromise]] to a new promise rejected with
    //          stream.[[storedError]].
    let storedError = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_STORED_ERROR);
    UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_CLOSED_PROMISE,
                          CreatePromiseRejectedWith(storedError));
  }
}

// Streams spec, 3.7.5. ReadableStreamReaderGenericRelease ( reader )
function ReadableStreamReaderGenericRelease(reader) {
  assert(IsReadableStreamDefaultReader(reader) ||
         IsReadableStreamBYOBReader(reader), "must be either a default or byob reader");

  // Step 1: Assert: reader.[[ownerReadableStream]] is not undefined.
  let stream = UnsafeGetObjectFromReservedSlot(reader,
                                               READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);
  assert(IsReadableStream(stream), "reader should be owned by a ReadableStream");

  // Step 2: Assert: reader.[[ownerReadableStream]].[[reader]] is not undefined.
  assert(UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_READER) === reader,
         "owning ReadableStream should reference the given reader");

  let e = GetTypeError(JSMSG_READABLESTREAMREADER_RELEASED);

  // Step 3: If reader.[[ownerReadableStream]].[[state]] is "readable", reject
  //         reader.[[closedPromise]] with a TypeError exception.
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (state & READABLESTREAM_STATE_READABLE) {
      let closedPromise = UnsafeGetObjectFromReservedSlot(reader,
                                                          READABLESTREAMREADER_SLOT_CLOSED_PROMISE);
      RejectPromise(closedPromise, e);
  } else {
    // Step 4: Otherwise, set reader.[[closedPromise]] to a new promise rejected
    //         with a TypeError exception.
    UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_CLOSED_PROMISE,
                          CreatePromiseRejectedWith(e));
  }

  // Step 5: Set reader.[[ownerReadableStream]].[[reader]] to undefined.
  UnsafeSetReservedSlot(stream, READABLESTREAM_SLOT_READER, undefined);

  // Step 6: Set reader.[[ownerReadableStream]] to undefined.
  UnsafeSetReservedSlot(reader, READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM, undefined);
}

// Streams spec, 3.7.6. ReadableStreamBYOBReaderRead ( reader, view )
function ReadableStreamBYOBReaderRead(reader, view) {
  assert(IsReadableStreamBYOBReader(reader), "must be a byob reader");

  // Step 1: Let stream be reader.[[ownerReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(reader,
                                               READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);

  // Step 2: Assert: stream is not undefined.
  assert(IsReadableStream(stream), "must be owned by a ReadableStream");

  // Step 3: Set stream.[[disturbed]] to true.
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  state |= READABLESTREAM_IS_DISTURBED;
  UnsafeSetReservedSlot(stream, READABLESTREAM_SLOT_STATE, state);

  // Step 4: If stream.[[state]] is "errored", return a promise rejected with
  //         stream.[[storedError]].
  if (state & READABLESTREAM_STATE_ERRORED) {
    let storedError = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_STORED_ERROR);
    return CreatePromiseRejectedWith(storedError);
  }

  // Step 5: Return ! ReadableByteStreamControllerPullInto(stream.[[readableStreamController]], view).
  let controller = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_CONTROLLER);
  return ReadableByteStreamControllerPullInto(controller, view);
}

// Streams spec, 3.7.7. ReadableStreamDefaultReaderRead ( reader )
function ReadableStreamDefaultReaderRead(reader) {
  assert(IsReadableStreamDefaultReader(reader), "must be a default reader");

  // Step 1: Let stream be reader.[[ownerReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(reader,
                                               READABLESTREAMREADER_SLOT_OWNER_READABLE_STREAM);

  // Step 2: Assert: stream is not undefined.
  assert(IsReadableStream(stream), "must be owned by a ReadableStream");

  // Step 3: Set stream.[[disturbed]] to true.
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  state |= READABLESTREAM_IS_DISTURBED;
  UnsafeSetReservedSlot(stream, READABLESTREAM_SLOT_STATE, state);

  // Step 4: If stream.[[state]] is "closed", return a new promise resolved with
  //         ! CreateIterResultObject(undefined, true).
  if (state & READABLESTREAM_STATE_CLOSED)
    return CreatePromiseResolvedWith({value: undefined, done: true});

  // Step 5: If stream.[[state]] is "errored", return a new promise rejected with
  //         stream.[[storedError]].
  if (state & READABLESTREAM_STATE_ERRORED) {
    let storedError = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_STORED_ERROR);
    return CreatePromiseRejectedWith(storedError);
  }

  // Step 6: Assert: stream.[[state]] is "readable".
  assert(state & READABLESTREAM_STATE_READABLE, "must be readable if not closed or errored");

  // Step 7: Return ! stream.[[readableStreamController]].[[Pull]]().
  // This part is a bit annoying: we don't actually want to store the `Pull`
  // method in a slot, so we have to check the type of the controller and call
  // the right method manually.
  let controller = UnsafeGetObjectFromReservedSlot(stream, READABLESTREAM_SLOT_CONTROLLER);
  let PullMethod = IsReadableStreamDefaultController(controller)
                   ? ReadableStreamDefaultController_pull
                   : ReadableByteStreamController_pull;
  return callFunction(PullMethod, controller);
}

// Streams spec, 3.8.3 new ReadableStreamDefaultController ( stream, underlyingSource,
//                                                           size, highWaterMark )
function ReadableStreamDefaultController(stream, underlyingSource, size, highWaterMark) {
  if (!IsReadableStreamDefaultController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamDefaultController",
                   "ctor", typeof this);
  }

  // Step 1: If ! IsReadableStream(stream) is false, throw a TypeError exception.
  if (!IsObject(stream) || !IsReadableStream(stream)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream",
                   "ReadableStreamDefaultController", typeof stream);
  }

  // Step 2: If stream.[[readableStreamController]] is not undefined, throw a
  //         TypeError exception.
  if (UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_CONTROLLER) !== undefined)
    ThrowTypeError(JSMSG_READABLESTREAM_CONTROLLER_SET);

  // Step 3: Set this.[[controlledReadableStream]] to stream.
  UnsafeSetReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM, stream);

  // Step 4: Set this.[[underlyingSource]] to underlyingSource.
  UnsafeSetReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_UNDERLYING_SOURCE,
                        underlyingSource);

  // Step 5: Perform ! ResetQueue(this).
  ResetQueue(this);

  // Step 6: Set this.[[started]], this.[[closeRequested]], this.[[pullAgain]],
  //         and this.[[pulling]] to false.
  UnsafeSetReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_FLAGS, 0);

  // Step 7: Let normalizedStrategy be
  //         ? ValidateAndNormalizeQueuingStrategy(size, highWaterMark).
  let normalizedStrategy = ValidateAndNormalizeQueuingStrategy(size, highWaterMark);

  // Step 8: Set this.[[strategySize]] to normalizedStrategy.[[size]] and
  //         this.[[strategyHWM]] to normalizedStrategy.[[highWaterMark]].
  UnsafeSetReservedSlot(this, READABLESTREAMDEFAULTCONTROLLER_SLOT_STRATEGY_SIZE,
                        normalizedStrategy.size);
  UnsafeSetReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_STRATEGY_HWM,
                        normalizedStrategy.highWaterMark);

  // Step 9: Let controller be this.
  let controller = this;

  // Step 10: Let startResult be
  //          ? InvokeOrNoop(underlyingSource, "start", « this »).
  let startResult = InvokeOrNoop(underlyingSource, "start", [this]);

  // Step 11: Let startPromise be a promise resolved with startResult:
  let startPromise = CreatePromiseResolvedWith(startResult);
  AddPromiseReactions(startPromise,
    // Step a: Upon fulfillment of startPromise,
    () => {
      // Step i: Set controller.[[started]] to true.
      SET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_STARTED);

      // Step ii: Assert: controller.[[pulling]] is false.
      assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_PULLING),
             "should not be pulling after start promise resolves");

      // Step iii: Assert: controller.[[pullAgain]] is false.
      assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) &
               READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN),
             "should not need to pull again after start promise resolves");

      // Step iv: Perform ! ReadableStreamDefaultControllerCallPullIfNeeded(controller).
      ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    },

    // Step b: Upon rejection with reason r,
    r => {
      // Step i: Perform ! ReadableStreamDefaultControllerErrorIfNeeded(controller, r).
      ReadableStreamDefaultControllerErrorIfNeeded(controller, r);
    }
  );
}

// Streams spec, 3.8.4.1. get desiredSize
function ReadableStreamDefaultController_desiredSize() {
  // Step 1: If ! IsReadableStreamDefaultController(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableStreamDefaultController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamDefaultController",
                   "desiredSize", typeof this);
  }

  // Step 2: Return ! ReadableStreamDefaultControllerGetDesiredSize(this).
  return ReadableStreamDefaultControllerGetDesiredSize(this);
}

// Streams spec, 3.8.4.2 close()
function ReadableStreamDefaultController_close() {
  // Step 1: If ! IsReadableStreamDefaultController(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableStreamDefaultController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamDefaultController",
                   "close", typeof this);
  }

  // Step 2: If this.[[closeRequested]] is true, throw a TypeError exception.
  if (READABLESTREAMCONTROLLER_FLAGS(this) & READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED)
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_CLOSED, "close");

  // Step 3: If this.[[controlledReadableStream]].[[state]] is not "readable",
  //         throw a TypeError exception.
  let stream = UnsafeGetObjectFromReservedSlot(this,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (!(state & READABLESTREAM_STATE_READABLE))
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_NOT_READABLE, "close");

  // Step 4: Perform ! ReadableStreamDefaultControllerClose(this).
  ReadableStreamDefaultControllerClose(this);
}

// Streams spec, 3.8.4.3. enqueue ( chunk )
function ReadableStreamDefaultController_enqueue(chunk) {
  // Step 1: If ! IsReadableStreamDefaultController(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableStreamDefaultController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamDefaultController",
                   "enqueue", typeof this);
  }

  // Step 2: If this.[[closeRequested]] is true, throw a TypeError exception.
  if (READABLESTREAMCONTROLLER_FLAGS(this) & READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED)
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_CLOSED, "enqueue");

  // Step 3: If this.[[controlledReadableStream]].[[state]] is not "readable",
  //         throw a TypeError exception.
  let stream = UnsafeGetObjectFromReservedSlot(this,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (!(state & READABLESTREAM_STATE_READABLE))
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_NOT_READABLE, "enqueue");

  // Step 4: Return ! ReadableStreamDefaultControllerEnqueue(this, chunk).
  return ReadableStreamDefaultControllerEnqueue(this, chunk);
}

// Streams spec, 3.8.4.4. error ( e )
function ReadableStreamDefaultController_error(e) {
  // Step 1: If ! IsReadableStreamDefaultController(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableStreamDefaultController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamDefaultController",
                   "enqueue", typeof this);
  }

  // Step 2: Let stream be this.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(this,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 3: If stream.[[state]] is not "readable", throw a TypeError exception.
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (!(state & READABLESTREAM_STATE_READABLE))
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_NOT_READABLE, "error");

  // Step 4: Perform ! ReadableStreamDefaultControllerError(this, e).
  ReadableStreamDefaultControllerError(this, e);
}

// Streams spec, 3.8.5.1. [[Cancel]] ( reason )
function ReadableStreamDefaultController_cancel(reason) {
  assert(IsReadableStreamDefaultController(this),
         "must operate on a ReadableStreamDefaultController");

  // Step 1: Perform ! ResetQueue(this).
  ResetQueue(this);

  // Step 2: Return ! PromiseInvokeOrNoop(this.[[underlyingSource]], "cancel", « reason »)
  let underlyingSource =
    UnsafeGetObjectFromReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_UNDERLYING_SOURCE);
  return PromiseInvokeOrNoop(underlyingSource, "cancel", [reason]);
}

// Streams spec, 3.8.5.2. [[Pull]] ( )
function ReadableStreamDefaultController_pull() {
  assert(IsReadableStreamDefaultController(this),
         "must operate on a ReadableStreamDefaultController");

  // Step 1: Let stream be this.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(this,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: If this[[queue]] is not empty,
  let queue = UnsafeGetObjectFromReservedSlot(this, QUEUE_CONTAINER_SLOT_QUEUE);
  if (queue.length !== 0) {
    // Step a: Let chunk be ! DequeueValue(this.[[queue]]).
    let chunk = DequeueValue(this);

    // Step b: If this.[[closeRequested]] is true and this.[[queue]] is empty,
    //         perform ! ReadableStreamClose(stream).
    let closeRequested = READABLESTREAMCONTROLLER_FLAGS(this) &
                         READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED;
    if (closeRequested && queue.length === 0)
      ReadableStreamClose(stream);

    // Step c: Otherwise, perform ! ReadableStreamDefaultControllerCallPullIfNeeded(this).
    else
      ReadableStreamDefaultControllerCallPullIfNeeded(this);

    // Step d: Return a promise resolved with ! CreateIterResultObject(chunk, false).
    return CreatePromiseResolvedWith({value: chunk, done: false});
  }

  // Step 3: Let pendingPromise be ! ReadableStreamAddReadRequest(stream).
  let pendingPromise = ReadableStreamAddReadRequest(stream);

  // Step 4: Perform ! ReadableStreamDefaultControllerCallPullIfNeeded(this).
  ReadableStreamDefaultControllerCallPullIfNeeded(this);

  // Step 5: Return pendingPromise.
  return pendingPromise;
}

// Streams spec, 3.9.1 IsReadableStreamDefaultController ( x )
// Implemented via intrinsic_isInstanceOfBuiltin<ReadableStreamDefaultController>()

// Streams spec, 3.9.2 ReadableStreamDefaultControllerCallPullIfNeeded ( controller )
function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
  assert(IsReadableStreamDefaultController(controller),
         "must operate on a ReadableStreamDefaultController");

  // Step 1: Let shouldPull be ! ReadableStreamDefaultControllerShouldCallPull(controller).
  let shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);

  // Step 2: If shouldPull is false, return.
  if (!shouldPull)
    return;

  // Step 3: If controller.[[pulling]] is true,
  if (READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_PULLING) {
    // Step a: Set controller.[[pullAgain]] to true.
    SET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN);

    // Step b: Return.
    return;
  }

  // Step 4: Assert: controller.[[pullAgain]] is false.
  assert(!READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN),
         "Mustn't have the pullAgain flag set");

  // Step 5: Set controller.[[pulling]] to true.
  SET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULLING);

  // Step 6: Let pullPromise be
  //         ! PromiseInvokeOrNoop(controller.[[underlyingSource]], "pull", « controller »).
  let underlyingSource =
    UnsafeGetObjectFromReservedSlot(controller, READABLESTREAMCONTROLLER_SLOT_UNDERLYING_SOURCE);
  let pullPromise = PromiseInvokeOrNoop(underlyingSource, "pull", [controller]);

  // Step 7: Upon fulfillment of pullPromise,
  AddPromiseReactions(pullPromise, () => {
    // Step a: Set controller.[[pulling]] to false.
    UNSET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULLING);

    // Step b: If controller.[[pullAgain]] is true,
    if (READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN) {
      // Step i: Set controller.[[pullAgain]] to false.
      UNSET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN);

      // Step ii: Perform ! ReadableStreamDefaultControllerCallPullIfNeeded(controller).
      ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    }
  },

  // Step 8: Upon rejection of pullPromise with reason e,
  e => {
    // Step a: If controller.[[controlledReadableStream]].[[state]] is "readable",
    //         perform ! ReadableStreamDefaultControllerError(controller, e).
    let stream = UnsafeGetObjectFromReservedSlot(controller,
                                                 READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
    assert(IsReadableStream(stream), "controller should have a ReadableStream");
    let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
    if (state & READABLESTREAM_STATE_READABLE)
      ReadableStreamDefaultControllerError(controller, e);
  });
}

// Streams spec, 3.9.3. ReadableStreamDefaultControllerShouldCallPull ( controller )
function ReadableStreamDefaultControllerShouldCallPull(controller) {
  assert(IsReadableStreamDefaultController(controller),
         "must operate on a ReadableStreamDefaultController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: If stream.[[state]] is "closed" or stream.[[state]] is "errored",
  //         return false.
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (state & (READABLESTREAM_STATE_CLOSED | READABLESTREAM_STATE_ERRORED))
    return false;

  // Step 3: If controller.[[closeRequested]] is true, return false.
  if (READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED)
    return false;

  // Step 4: If controller.[[started]] is false, return false.
  if (!(READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_STARTED))
    return false;

  // Step 5: If ! IsReadableStreamLocked(stream) is true and
  //         ! ReadableStreamGetNumReadRequests(stream) > 0, return true.
  if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0)
    return true;

  // Step 6: Let desiredSize be ReadableStreamDefaultControllerGetDesiredSize(controller).
  let desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);

  // Step 7: If desiredSize > 0, return true.
  // Step 8: Return false.
  return desiredSize > 0;
}

// Streams spec, 3.9.4. ReadableStreamDefaultControllerClose ( controller )
function ReadableStreamDefaultControllerClose(controller) {
  assert(IsReadableStreamDefaultController(controller),
         "must operate on a ReadableStreamDefaultController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: Assert: controller.[[closeRequested]] is false.
  assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) &
           READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED),
         "controller should not have a pending close operation");

  // Step 3: Assert: stream.[[state]] is "readable".
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_STATE_READABLE,
         "stream should be in the readable state");

  // Step 4: Set controller.[[closeRequested]] to true.
  SET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED);

  // Step 5: If controller.[[queue]] is empty, perform ! ReadableStreamClose(stream).
  let queue = UnsafeGetObjectFromReservedSlot(controller, QUEUE_CONTAINER_SLOT_QUEUE);
  if (queue.length === 0)
    ReadableStreamClose(stream);
}

// Streams spec, 3.9.5. ReadableStreamDefaultControllerEnqueue ( controller, chunk )
function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
  assert(IsReadableStreamDefaultController(controller),
         "must operate on a ReadableStreamDefaultController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: Assert: controller.[[closeRequested]] is false.
  assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) &
           READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED),
         "controller should not have a pending close operation");

  // Step 3: Assert: stream.[[state]] is "readable".
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_STATE_READABLE,
         "stream should be in the readable state");

  // Step 4: If ! IsReadableStreamLocked(stream) is true and
  //         ! ReadableStreamGetNumReadRequests(stream) > 0, perform
  //         ! ReadableStreamFulfillReadRequest(stream, chunk, false).
  if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
    ReadableStreamFulfillReadRequest(stream, chunk, false);
  } else {
    // Step 5: Otherwise,
    // Step a: Let chunkSize be 1.
    let chunkSize = 1;

    // Step b: If controller.[[strategySize]] is not undefined,
    let strategySize = UnsafeGetReservedSlot(controller,
                                             READABLESTREAMDEFAULTCONTROLLER_SLOT_STRATEGY_SIZE);
    if (strategySize !== undefined) {
      // Step i: Set chunkSize to Call(stream.[[strategySize]], undefined, chunk).
      try {
        chunkSize = callContentFunction(strategySize, undefined, chunk);
      } catch (e) {
        // Step ii: If chunkSize is an abrupt completion,
        // Step i: Perform
        //         ! ReadableStreamDefaultControllerErrorIfNeeded(controller,
        //                                                        chunkSize.[[Value]]).
        ReadableStreamDefaultControllerErrorIfNeeded(controller, e);

        // Step 2: Return chunkSize.
        throw e;
      }
    }

    // Step c: Let enqueueResult be
    //         ! EnqueueValueWithSize(controller, chunk, chunkSize).
    try {
      EnqueueValueWithSize(controller, chunk, chunkSize);
    } catch (e) {
      // Step d: If enqueueResult is an abrupt completion,
      // Step i: Perform
      //         ! ReadableStreamDefaultControllerErrorIfNeeded(controller,
      //                                                        enqueueResult.[[Value]]).
      ReadableStreamDefaultControllerErrorIfNeeded(controller, e);

      // Step ii: Return enqueueResult.
      throw e;
    }
  }

  // Step 6: Perform ! ReadableStreamDefaultControllerCallPullIfNeeded(controller).
  ReadableStreamDefaultControllerCallPullIfNeeded(controller);

  // Step 7: Return (implicit).
}

// Streams spec, 3.9.6. ReadableStreamDefaultControllerError ( controller, e )
function ReadableStreamDefaultControllerError(controller, e) {
  assert(IsReadableStreamDefaultController(controller),
         "must operate on a ReadableStreamDefaultController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: Assert: stream.[[state]] is "readable".
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_STATE_READABLE,
         "stream should be in the readable state");

  // Step 3: Perform ! ResetQueue(controller).
  ResetQueue(controller);

  // Step 4: Perform ! ReadableStreamError(stream, e).
  ReadableStreamError(stream, e);
}

// Streams spec, 3.9.7. ReadableStreamDefaultControllerErrorIfNeeded ( controller, e ) nothrow
function ReadableStreamDefaultControllerErrorIfNeeded(controller, e) {
  // Step 1: If controller.[[controlledReadableStream]].[[state]] is "readable",
  //         perform ! ReadableStreamDefaultControllerError(controller, e).
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  if (UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
      READABLESTREAM_STATE_READABLE)
  {
    ReadableStreamDefaultControllerError(controller, e);
  }
}

// Streams spec, 3.9.8. ReadableStreamDefaultControllerGetDesiredSize ( controller )
function ReadableStreamDefaultControllerGetDesiredSize(controller) {
  assert(IsReadableStreamDefaultController(controller),
         "must operate on a ReadableStreamDefaultController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);

  // Step 2: Let state be stream.[[state]].
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);

  // Step 3: If state is "errored", return null.
  if (state & READABLESTREAM_STATE_ERRORED)
    return null;

  // Step 4: If state is "closed", return 0.
  if (state & READABLESTREAM_STATE_CLOSED)
    return 0;

  // Step 5: Return controller.[[strategyHWM]] − controller.[[queueTotalSize]].
  let strategyHWM = UnsafeGetReservedSlot(controller, READABLESTREAMCONTROLLER_SLOT_STRATEGY_HWM);
  let queueSize = UnsafeGetReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  return strategyHWM - queueSize;
}

// Streams spec, 3.10.3. new ReadableByteStreamController ( stream, underlyingByteSource, highWaterMark )
function ReadableByteStreamController(stream, underlyingByteSource, highWaterMark) {
  if (!IsReadableByteStreamController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableByteStreamController",
                   "ctor", typeof this);
  }

  // Step 1: If ! IsReadableStream(stream) is false, throw a TypeError exception.
  if (!IsObject(stream) || !IsReadableStream(stream)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStream",
                   "ReadableByteStreamController", typeof this);
  }

  // Step 2: If stream.[[readableStreamController]] is not undefined, throw a
  //         TypeError exception.
  let controller = UnsafeGetReservedSlot(stream, READABLESTREAM_SLOT_CONTROLLER);
  if (controller !== undefined)
    ThrowTypeError(JSMSG_READABLESTREAM_CONTROLLER_SET);

  // Step 3: Set this.[[controlledReadableStream]] to stream.
  UnsafeSetReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM, stream);

  // Step 4: Set this.[[underlyingByteSource]] to underlyingByteSource.
  UnsafeSetReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_UNDERLYING_SOURCE,
                        underlyingByteSource);

  // Step 5: Set this.[[pullAgain]], and this.[[pulling]] to false.
  UnsafeSetReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_FLAGS, 0);

  // Step 6: Perform ! ReadableByteStreamControllerClearPendingPullIntos(this).
  ReadableByteStreamControllerClearPendingPullIntos(this);

  // Step 7: Perform ! ResetQueue(this).
  ResetQueue(this);

  // Step 8: Set this.[[started]] and this.[[closeRequested]] to false.
  assert(UnsafeGetInt32FromReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_FLAGS) === 0,
         "No flags should have been set since step 5.");

  // Step 9: Set this.[[strategyHWM]] to
  //         ? ValidateAndNormalizeHighWaterMark(highWaterMark).
  UnsafeSetReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_STRATEGY_HWM,
                        ValidateAndNormalizeHighWaterMark(highWaterMark));

  // Step 10: Let autoAllocateChunkSize be
  //          ? GetV(underlyingByteSource, "autoAllocateChunkSize").
  let autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;

  // Step 11: If autoAllocateChunkSize is not undefined,
  if (autoAllocateChunkSize !== undefined) {
    // Step a: If ! IsInteger(autoAllocateChunkSize) is false, or if
    //         autoAllocateChunkSize ≤ 0, throw a RangeError exception.
    if (!IsInteger(autoAllocateChunkSize) || autoAllocateChunkSize <= 0)
      ThrowRangeError(JSMSG_READABLEBYTESTREAMCONTROLLER_BAD_CHUNKSIZE);
  }

  // Step 12: Set this.[[autoAllocateChunkSize]] to autoAllocateChunkSize.
  UnsafeSetReservedSlot(this, READABLEBYTESTREAMCONTROLLER_SLOT_AUTO_ALLOCATE_CHUNK_SIZE,
                        autoAllocateChunkSize);

  // Step 13: Set this.[[pendingPullIntos]] to a new empty List.
  UnsafeSetReservedSlot(this, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS,
                        new List());

  // Step 14: Let controller be this.
  controller = this;

  // Step 15: Let startResult be ? InvokeOrNoop(underlyingByteSource, "start", « this »).
  let startResult = InvokeOrNoop(underlyingByteSource, "start", [this]);

  // Step 16: Let startPromise be a promise resolved with startResult:
  let startPromise = CreatePromiseResolvedWith(startResult);
  AddPromiseReactions(startPromise,
    // Step a: Upon fulfillment,
    () => {
      // Step i: Set controller.[[started]] to true.
      SET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_STARTED);

      // Step ii: Assert: controller.[[pulling]] is false.
      assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_PULLING),
             "should not be pulling after start promise resolves");

      // Step iii: Assert: controller.[[pullAgain]] is false.
      assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN),
             "should not need to pull again after start promise resolves");

      // Step iv: Perform ! ReadableByteStreamControllerCallPullIfNeeded(controller).
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    },

    // Step b: Upon rejection with reason r,
    r => {
      // Step i: If stream.[[state]] is "readable", perform
      //         ! ReadableByteStreamControllerError(controller, r).
      let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
      if (state & READABLESTREAM_STATE_READABLE)
        ReadableByteStreamControllerError(controller, r);
    }
  );
}

// Streams spec, 3.10.4.1. get byobRequest
function ReadableByteStreamController_byobRequest() {
  // Step 1: If IsReadableByteStreamController(this) is false, throw a TypeError
  //         exception.
  if (!IsReadableByteStreamController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableByteStreamController",
                   "byobRequest", typeof this);
  }

  // Step 2: If this.[[byobRequest]] is undefined and this.[[pendingPullIntos]]
  //         is not empty,
  let byobRequest =
    UnsafeGetReservedSlot(this, READABLEBYTESTREAMCONTROLLER_SLOT_BYOB_REQUEST);
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(this, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  if (byobRequest === undefined && pendingPullIntos.length !== 0) {
    // Step a: Let firstDescriptor be the first element of this.[[pendingPullIntos]].
    let firstDescriptor = pendingPullIntos[0];

    // Step b: Let view be ! Construct(%Uint8Array%,
    //  « firstDescriptor.[[buffer]],
    //  firstDescriptor.[[byteOffset]] + firstDescriptor.[[bytesFilled]],
    //  firstDescriptor.[[byteLength]] − firstDescriptor.[[bytesFilled]] »).
    let view = new Uint8Array(firstDescriptor.buffer,
                              firstDescriptor.byteOffset + firstDescriptor.bytesFilled,
                              firstDescriptor.byteLength - firstDescriptor.bytesFilled);

    // Step c: Set this.[[byobRequest]] to
    //         ! Construct(ReadableStreamBYOBRequest, « this, view »).
    let ReadableStreamBYOBRequestCtor = GetBuiltinConstructor("ReadableStreamBYOBRequest");
    byobRequest = new ReadableStreamBYOBRequestCtor(this, view);
    UnsafeSetReservedSlot(this, READABLEBYTESTREAMCONTROLLER_SLOT_BYOB_REQUEST, byobRequest);
  }

  // Step 3: Return this.[[byobRequest]].
  return byobRequest;
}

// Streams spec, 3.10.4.2. get desiredSize
function ReadableByteStreamController_desiredSize() {
  // Step 1: If ! IsReadableByteStreamController(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableByteStreamController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableByteStreamController",
                   "desiredSize", typeof this);
  }

  // Step 2: Return ! ReadableByteStreamControllerGetDesiredSize(this).
  return ReadableByteStreamControllerGetDesiredSize(this);
}

// Streams spec, 3.10.4.3. close()
function ReadableByteStreamController_close() {
  // Step 1: If ! IsReadableByteStreamController(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableByteStreamController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableByteStreamController",
                   "close", typeof this);
  }

  // Step 2: If this.[[closeRequested]] is true, throw a TypeError exception.
  if (READABLESTREAMCONTROLLER_FLAGS(this) & READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED)
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_CLOSED, "close");

  // Step 3: If this.[[controlledReadableStream]].[[state]] is not "readable",
  //         throw a TypeError exception.
  let stream = UnsafeGetObjectFromReservedSlot(this,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (!(state & READABLESTREAM_STATE_READABLE))
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_NOT_READABLE, "close");

  // Step 4: Perform ? ReadableByteStreamControllerClose(this).
  ReadableByteStreamControllerClose(this);
}

// Streams spec, 3.10.4.4. enqueue ( chunk )
function ReadableByteStreamController_enqueue(chunk) {
  // Step 1: If ! IsReadableByteStreamController(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableByteStreamController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableByteStreamController",
                   "close", typeof this);
  }

  // Step 2: If this.[[closeRequested]] is true, throw a TypeError exception.
  if (READABLESTREAMCONTROLLER_FLAGS(this) & READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED)
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_CLOSED, "enqueue");

  // Step 3: If this.[[controlledReadableStream]].[[state]] is not "readable",
  //         throw a TypeError exception.
  let stream = UnsafeGetObjectFromReservedSlot(this,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (!(state & READABLESTREAM_STATE_READABLE))
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_NOT_READABLE, "enqueue");

  // Step 4: If Type(chunk) is not Object, throw a TypeError exception.
  // Step 5: If chunk does not have a [[ViewedArrayBuffer]] internal slot,
  //         throw a TypeError exception.
  if (!IsObject(chunk) || !IsTypedArray(chunk))
    ThrowTypeError(JSMSG_READABLEBYTESTREAMCONTROLLER_BAD_CHUNK);

  // Step 6: Return ! ReadableByteStreamControllerEnqueue(this, chunk).
  return ReadableByteStreamControllerEnqueue(this, chunk);
}

// Streams spec, 3.10.4.5. error ( e )
function ReadableByteStreamController_error(e) {
  // Step 1: If ! IsReadableByteStreamController(this) is false, throw a
  //         TypeError exception.
  if (!IsReadableByteStreamController(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableByteStreamController",
                   "close", typeof this);
  }

  // Step 2: Let stream be this.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(this,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 3: If stream.[[state]] is not "readable", throw a TypeError exception.
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (!(state & READABLESTREAM_STATE_READABLE))
    ThrowTypeError(JSMSG_READABLESTREAMCONTROLLER_NOT_READABLE, "error");

  // Step 4: Perform ! ReadableByteStreamControllerError(this, e).
  ReadableByteStreamControllerError(this, e);
}

// Streams spec, 3.10.5.1. [[Cancel]] ( reason )
function ReadableByteStreamController_cancel(reason) {
  assert(IsReadableByteStreamController(this), "must operate on ReadableByteStreamController");

  // Step 1: If this.[[pendingPullIntos]] is not empty,
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(this, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  if (pendingPullIntos.length !== 0) {
    // Step a: Let firstDescriptor be the first element of
    //         this.[[pendingPullIntos]].
    // Step b: Set firstDescriptor.[[bytesFilled]] to 0.
    pendingPullIntos[0].bytesFilled = 0;
  }

  // Step 2: Perform ! ResetQueue(this).
  ResetQueue(this);

  // Step 3: Return ! PromiseInvokeOrNoop(this.[[underlyingByteSource]], "cancel", « reason »)
  let underlyingByteSource =
    UnsafeGetObjectFromReservedSlot(this, READABLESTREAMCONTROLLER_SLOT_UNDERLYING_SOURCE);
  return PromiseInvokeOrNoop(underlyingByteSource, "cancel", [reason]);
}

// Streams spec, 3.10.5.2. [[Pull]] ( )
function ReadableByteStreamController_pull() {
  assert(IsReadableByteStreamController(this), "must operate on ReadableByteStreamController");

  // Step 1: Let stream be this.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(this,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);

  // Step 2: Assert: ! ReadableStreamHasDefaultReader(stream) is true.
  assert(ReadableStreamHasDefaultReader(stream), "Stream should have a default reader");

  // Step 3: If this.[[queueTotalSize]] > 0,
  let queueTotalSize = UnsafeGetInt32FromReservedSlot(this, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  if (queueTotalSize > 0) {
    // Step 3.a: Assert: ! ReadableStreamGetNumReadRequests(_stream_) is 0.
    assert(ReadableStreamGetNumReadRequests(stream) === 0, "Invalid stream state");

    // Step 3.b: Let entry be the first element of this.[[queue]].
    // Step 3.c: Remove entry from this.[[queue]], shifting all other elements
    //           downward (so that the second becomes the first, and so on).
    let queue = UnsafeGetObjectFromReservedSlot(this, QUEUE_CONTAINER_SLOT_QUEUE);
    let entry = ArrayStaticShift(queue);

    // Step 3.d: Set this.[[queueTotalSize]] to this.[[queueTotalSize]] − entry.[[byteLength]].
    queueTotalSize = queueTotalSize - entry.byteLength;
    UnsafeSetReservedSlot(this, QUEUE_CONTAINER_SLOT_TOTAL_SIZE, queueTotalSize);

    // Step 3.e: Perform ! ReadableByteStreamControllerHandleQueueDrain(this).
    ReadableByteStreamControllerHandleQueueDrain(this);

    // Step 3.f: Let view be ! Construct(%Uint8Array%, « entry.[[buffer]],
    //                                   entry.[[byteOffset]], entry.[[byteLength]] »).
    let Uint8Array = GetBuiltinConstructor("Uint8Array");
    let view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);

    // Step 3.g: Return a promise resolved with ! CreateIterResultObject(view, false).
    return CreatePromiseResolvedWith({value: view, done: false});
  }

  // Step 4: Let autoAllocateChunkSize be this.[[autoAllocateChunkSize]].
  let autoAllocateChunkSize =
      UnsafeGetReservedSlot(this, READABLEBYTESTREAMCONTROLLER_SLOT_AUTO_ALLOCATE_CHUNK_SIZE);

  // Step 5: If autoAllocateChunkSize is not undefined,
  if (autoAllocateChunkSize !== undefined) {
    // Step 5.a: Let buffer be Construct(%ArrayBuffer%, « autoAllocateChunkSize »).
    let ArrayBuffer = GetBuiltinConstructor("ArrayBuffer");
    let buffer;
    try {
      buffer = new ArrayBuffer(autoAllocateChunkSize);
    }

    // Step 5.b: If buffer is an abrupt completion,
    //           return a promise rejected with buffer.[[Value]].
    catch (e) {
      return CreatePromiseRejectedWith(e);
    }
    // Step 5.c: Let pullIntoDescriptor be Record {[[buffer]]: buffer.[[Value]],
    //                                             [[byteOffset]]: 0,
    //                                             [[byteLength]]: autoAllocateChunkSize,
    //                                             [[bytesFilled]]: 0, [[elementSize]]: 1,
    //                                             [[ctor]]: %Uint8Array%,
    //                                             [[readerType]]: `"default"`}.
    let pullIntoDescriptor = {
      __proto__: null,
      buffer,
      byteOffset: 0,
      byteLength: autoAllocateChunkSize,
      bytesFilled: 0,
      elementSize: 1,
      ctor: GetBuiltinConstructor("Uint8Array"),
      readerType: "default"
    };

    // Step 5.d: Append pullIntoDescriptor as the last element of this.[[pendingPullIntos]].
    let pendingPullIntos =
      UnsafeGetObjectFromReservedSlot(this, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
    ArrayStaticPush(pendingPullIntos, pullIntoDescriptor);
  }

  // Step 6: Let promise be ! ReadableStreamAddReadRequest(stream).
  let promise = ReadableStreamAddReadRequest(stream);

  // Step 7: Perform ! ReadableByteStreamControllerCallPullIfNeeded(this).
  ReadableByteStreamControllerCallPullIfNeeded(this);

  // Step 8: Return promise.
  return promise;
}

// Streams spec, 3.11.3. new ReadableStreamBYOBRequest ( controller, view )
function ReadableStreamBYOBRequest(controller, view) {
  if (!IsReadableStreamBYOBRequest(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamBYOBRequest",
                   "ctor", typeof this);
  }

  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  assert(IsObject(view), "view should be an object");

  // Step 1: Set this.[[associatedReadableByteStreamController]] to controller.
  UnsafeSetReservedSlot(this, READABLESTREAMBYOBREQUEST_SLOT_ASSOCIATED_READABLE_BYTESTREAM_CONTROLLER,
                        controller);

  // Step 2: Set this.[[view]] to view.
  UnsafeSetReservedSlot(this, READABLESTREAMBYOBREQUEST_SLOT_VIEW, view);
}

// Streams spec, 3.11.4.1 get view
function ReadableStreamBYOBRequest_view() {
  // Step 1: If ! IsReadableStreamBYOBRequest(this) is false, throw a TypeError
  //         exception.
  if (!IsReadableStreamBYOBRequest(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamBYOBRequest",
                   "view", typeof this);
  }

  // Step 2: Return this.[[view]].
  return UnsafeGetObjectFromReservedSlot(this, READABLESTREAMBYOBREQUEST_SLOT_VIEW);
}

// Streams spec, 3.11.4.2. respond ( bytesWritten )
function ReadableStreamBYOBRequest_respond(bytesWritten) {
  // Step 1: If ! IsReadableStreamBYOBRequest(this) is false, throw a TypeError
  //         exception.
  if (!IsReadableStreamBYOBRequest(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamBYOBRequest",
                   "view", typeof this);
  }

  // Step 2: If this.[[associatedReadableByteStreamController]] is undefined,
  //         throw a TypeError exception.
  let controller =
    UnsafeGetReservedSlot(this, READABLESTREAMBYOBREQUEST_SLOT_ASSOCIATED_READABLE_BYTESTREAM_CONTROLLER);
  if (controller === undefined)
    ThrowTypeError(JSMSG_READABLESTREAMBYOBREQUEST_NO_CONTROLLER, "respond");

  // Step 3: Return ? ReadableByteStreamControllerRespond(this.[[associatedReadableByteStreamController]],
  //                                                      bytesWritten).
  return ReadableByteStreamControllerRespond(controller, bytesWritten);
}

// Streams spec, 3.11.4.3. respondWithNewView ( view )
function ReadableStreamBYOBRequest_respondWithNewView(view) {
  // Step 1: If ! IsReadableStreamBYOBRequest(this) is false, throw a TypeError
  //         exception.
  if (!IsReadableStreamBYOBRequest(this)) {
    ThrowTypeError(JSMSG_INCOMPATIBLE_PROTO, "ReadableStreamBYOBRequest",
                   "respondWithView", typeof this);
  }

  // Step 2: If this.[[associatedReadableByteStreamController]] is undefined,
  //         throw a TypeError exception.
  let controller =
    UnsafeGetReservedSlot(this, READABLESTREAMBYOBREQUEST_SLOT_ASSOCIATED_READABLE_BYTESTREAM_CONTROLLER);
  if (controller === undefined)
    ThrowTypeError(JSMSG_READABLESTREAMBYOBREQUEST_NO_CONTROLLER, "respond");

  // Step 3: If Type(chunk) is not Object, throw a TypeError exception.
  // Step 4: If view does not have a [[ViewedArrayBuffer]] internal slot, throw
  //         a TypeError exception.
  if (!IsObject(view) || !IsTypedArray(view))
    ThrowTypeError(JSMSG_READABLEBYTESTREAMCONTROLLER_BAD_CHUNK);

  // Step 5: Return ? ReadableByteStreamControllerRespondWithNewView(this.[[associatedReadableByteStreamController]],
  //                                                                 view).
  return ReadableByteStreamControllerRespondWithNewView(controller, view);
}

// Streams spec, 3.12.1. IsReadableStreamBYOBRequest ( x )
// Implemented via intrinsic_isInstanceOfBuiltin<ReadableStreamBYOBRequest>()

// Streams spec, 3.12.2. IsReadableByteStreamController ( x )
// Implemented via intrinsic_isInstanceOfBuiltin<ReadableByteStreamController>()

// Streams spec, 3.12.3. ReadableByteStreamControllerCallPullIfNeeded ( controller )
function ReadableByteStreamControllerCallPullIfNeeded(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let shouldPull be
  //         ! ReadableByteStreamControllerShouldCallPull(controller).
  let shouldPull = ReadableByteStreamControllerShouldCallPull(controller);

  // Step 2: If shouldPull is false, return.
  if (!shouldPull)
    return;

  // Step 3: If controller.[[pulling]] is true,
  if (READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_PULLING) {
    // Step a: Set controller.[[pullAgain]] to true.
    SET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN);

    // Step b: Return.
    return;
  }

  // Step 4: Assert: controller.[[pullAgain]] is false.
  assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN),
         "Controller's pullAgain flag must be false");

  // Step 5: Set controller.[[pulling]] to true.
  SET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULLING);

  // Step 6: Let pullPromise be
  //         ! PromiseInvokeOrNoop(controller.[[underlyingByteSource]], "pull", controller).
  let underlyingSource =
    UnsafeGetObjectFromReservedSlot(controller, READABLESTREAMCONTROLLER_SLOT_UNDERLYING_SOURCE);
  let pullPromise = PromiseInvokeOrNoop(underlyingSource, "pull", [controller]);

  // Step 7: Upon fulfillment of pullPromise,
  AddPromiseReactions(pullPromise, () => {
    // Step a: Set controller.[[pulling]] to false.
    UNSET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULLING);

    // Step b: If controller.[[pullAgain]] is true,
    if (READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN) {
      // Step i: Set controller.[[pullAgain]] to false.
      UNSET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_PULL_AGAIN);

      // Step ii: Perform ! ReadableByteStreamControllerCallPullIfNeeded(controller).
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
  },

  // Step 8: Upon rejection of pullPromise with reason e,
  e => {
    // Step a: If controller.[[controlledReadableStream]].[[state]] is "readable",
    //         perform ! ReadableByteStreamControllerError(controller, e).
    let stream = UnsafeGetObjectFromReservedSlot(controller,
                                                 READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
    assert(IsReadableStream(stream), "controller should have a ReadableStream");
    let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
    if (state & READABLESTREAM_STATE_READABLE)
      ReadableByteStreamControllerError(controller, e);
  });
}

// Streams spec, 3.12.4. ReadableByteStreamControllerClearPendingPullIntos ( controller )
function ReadableByteStreamControllerClearPendingPullIntos(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Perform ! ReadableByteStreamControllerInvalidateBYOBRequest(controller).
  ReadableByteStreamControllerInvalidateBYOBRequest(controller);

  // Step 2: Set controller.[[pendingPullIntos]] to a new empty List.
  UnsafeSetReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS,
                        new List());
}

// Streams spec, 3.12.5. ReadableByteStreamControllerClose ( controller )
function ReadableByteStreamControllerClose(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: Assert: controller.[[closeRequested]] is false.
  assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED),
         "controller should not have a close requested");

  // Step 3: Assert: stream.[[state]] is "readable".
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_STATE_READABLE,
         "controller's stream should be in the readable state");

  // Step 4: If controller.[[queueTotalSize]] > 0,
  let queueTotalSize = UnsafeGetInt32FromReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  if (queueTotalSize > 0) {
    // Step a: Set controller.[[closeRequested]] to true.
    SET_READABLESTREAMCONTROLLER_FLAGS(controller, READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED);

    // Step b: Return
    return;
  }

  // Step 5: If controller.[[pendingPullIntos]] is not empty,
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  if (pendingPullIntos.length !== 0) {
    // Step a: Let firstPendingPullInto be the first element of
    //         controller.[[pendingPullIntos]].
    let firstPendingPullInto = pendingPullIntos[0];

    // Step b: If firstPendingPullInto.[[bytesFilled]] > 0,
    if (firstPendingPullInto.bytesFilled > 0) {
      try {
        // Step i: Let e be a new TypeError exception.
        ThrowTypeError(JSMSG_READABLEBYTESTREAMCONTROLLER_CLOSE_PENDING_PULL);
      } catch (e) {
        // Step ii: Perform ! ReadableByteStreamControllerError(controller, e).
        ReadableByteStreamControllerError(controller, e);

        // Step iii: Throw e.
        throw e;
      }
    }
  }

  // Step 6: Perform ! ReadableStreamClose(stream).
  ReadableStreamClose(stream);
}

// Streams spec, 3.12.6. ReadableByteStreamControllerCommitPullIntoDescriptor ( stream, pullIntoDescriptor )
function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
  assert(IsReadableStream(stream), "must operate on a ReadableStream");

  // Step 1: Assert: stream.[[state]] is not "errored".
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  assert(!(state & READABLESTREAM_STATE_ERRORED), "stream must not be in the errored state");

  // Step 2: Let done be false.
  let done = false;

  // Step 3: If stream.[[state]] is "closed",
  if (state & READABLESTREAM_STATE_CLOSED) {
    // Step a: Assert: pullIntoDescriptor.[[bytesFilled]] is 0.
    assert(pullIntoDescriptor.bytesFilled === 0, "pullIntoDescriptor should be empty");

    // Step b: Set done to true.
    done = true;
  }

  // Step 4: Let filledView be
  //         ! ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor).
  let filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);

  // Step 5: If pullIntoDescriptor.[[readerType]] is "default",
  if (pullIntoDescriptor.readerType === "default") {
    // Step a: Perform ! ReadableStreamFulfillReadRequest(stream, filledView, done).
    ReadableStreamFulfillReadRequest(stream, filledView, done);
  } else {
    // Step 6: Otherwise,
    // Step a: Assert: pullIntoDescriptor.[[readerType]] is "byob".
    assert(pullIntoDescriptor.readerType === "byob", "must be byob if not default");

    // Step b: Perform ! ReadableStreamFulfillReadIntoRequest(stream, filledView, done).
    ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
  }
}

// Streams spec, 3.12.7. ReadableByteStreamControllerConvertPullIntoDescriptor ( pullIntoDescriptor )
function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
  // Step 1: Let bytesFilled be pullIntoDescriptor.[[bytesFilled]].
  let bytesFilled = pullIntoDescriptor.bytesFilled;

  // Step 2: Let elementSize be pullIntoDescriptor.[[elementSize]].
  let elementSize = pullIntoDescriptor.elementSize;

  // Step 3: Assert: bytesFilled <= pullIntoDescriptor.[[byteLength]].
  assert(bytesFilled <= pullIntoDescriptor.byteLength,
         `pullIntoDescriptor should not be filled beyond its capacity: ${bytesFilled} > ${pullIntoDescriptor.byteLength}`);

  // Step 4: Assert: bytesFilled mod elementSize is 0.
  assert(bytesFilled % elementSize === 0,
         "pullIntoDescriptor should be filled in multiples of its elementSize");

  // Step 5: Return ! Construct(pullIntoDescriptor.[[ctor]],
  //                            pullIntoDescriptor.[[buffer]],
  //                            pullIntoDescriptor.[[byteOffset]],
  //                            bytesFilled / elementSize).
  let ctor = pullIntoDescriptor.ctor;
  return new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset,
                  bytesFilled / elementSize);
}

// Streams spec, 3.12.8. ReadableByteStreamControllerEnqueue ( controller, chunk )
function ReadableByteStreamControllerEnqueue(controller, chunk) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: Assert: controller.[[closeRequested]] is false.
  assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) &
           READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED),
         "controller should not have a close requested");

  // Step 3: Assert: stream.[[state]] is "readable".
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_STATE_READABLE,
         "controller's stream should be in the readable state");

  // Step 4: Let buffer be chunk.[[ViewedArrayBuffer]].
  let buffer = TypedArrayBuffer(chunk);

  // Step 5: Let byteOffset be chunk.[[ByteOffset]].
  let byteOffset = UnsafeGetInt32FromReservedSlot(chunk, JS_TYPEDARRAYLAYOUT_BYTEOFFSET_SLOT);

  // Step 6: Let byteLength be chunk.[[ByteLength]].
  let byteLength = ArrayBufferByteLength(buffer);

  // Step 7: Let transferredBuffer be ! Transfer(buffer, the current Realm Record).
  let transferredBuffer = SameRealmTransfer(buffer);

  // Step 8: If ! ReadableStreamHasDefaultReader(stream) is true
  if (ReadableStreamHasDefaultReader(stream)) {
    // Step a: If ! ReadableStreamGetNumReadRequests(stream) is 0,
    if (ReadableStreamGetNumReadRequests(stream) === 0) {
      // Step i: Perform
      //         ! ReadableByteStreamControllerEnqueueChunkToQueue(controller,
      //                                                           transferredBuffer,
      //                                                           byteOffset,
      //                                                           byteLength).
      ReadableByteStreamControllerEnqueueChunkToQueue(controller,
                                                      transferredBuffer,
                                                      byteOffset, byteLength);
    } else {
      // Step b: Otherwise,
      // Step i: Assert: controller.[[queue]] is empty.
      assert(UnsafeGetObjectFromReservedSlot(controller, QUEUE_CONTAINER_SLOT_QUEUE) .length === 0,
             "controller queue must be empty");

      // Step ii: Let transferredView be
      //          ! Construct(%Uint8Array%, transferredBuffer, byteOffset, byteLength).
      let Uint8Array = GetBuiltinConstructor("Uint8Array");
      let transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);

      // Step iii: Perform ! ReadableStreamFulfillReadRequest(stream, transferredView, false).
      ReadableStreamFulfillReadRequest(stream, transferredView, false);
    }
  } else if (ReadableStreamHasBYOBReader(stream)) {
    // Step 9: Otherwise,
    // Step a: If ! ReadableStreamHasBYOBReader(stream) is true,
    // Step i: Perform
    //         ! ReadableByteStreamControllerEnqueueChunkToQueue(controller,
    //                                                           transferredBuffer,
    //                                                           byteOffset,
    //                                                           byteLength).
    ReadableByteStreamControllerEnqueueChunkToQueue(controller,
                                                    transferredBuffer,
                                                    byteOffset, byteLength);

    // Step ii: Perform ! ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller).
    ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
  } else {
    // Step b: Otherwise,
    // Step i: Assert: ! IsReadableStreamLocked(stream) is false.
    assert(!IsReadableStreamLocked(stream),
           "stream must be unlocked if there is neither a byob or default reader");

    // Step ii: Perform
    //          ! ReadableByteStreamControllerEnqueueChunkToQueue(controller,
    //                                                            transferredBuffer,
    //                                                            byteOffset,
    //                                                            byteLength).
    ReadableByteStreamControllerEnqueueChunkToQueue(controller,
                                                    transferredBuffer,
                                                    byteOffset, byteLength);
  }
}

// Streams spec, 3.12.9. ReadableByteStreamControllerEnqueueChunkToQueue ( controller, buffer, byteOffset, byteLength )
function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer,
                                                         byteOffset, byteLength) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Append Record {[[buffer]]: buffer,
  //                        [[byteOffset]]: byteOffset,
  //                        [[byteLength]]: byteLength}
  //         as the last element of controller.[[queue]].
  let queue = UnsafeGetObjectFromReservedSlot(controller, QUEUE_CONTAINER_SLOT_QUEUE);
  let record = {
    __proto__: null,
    buffer,
    byteOffset,
    byteLength
  };
  ArrayStaticPush(queue, record);

  // Step 2: Add byteLength to controller.[[queueTotalSize]].
  let queueTotalSize = UnsafeGetInt32FromReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  queueTotalSize += byteLength;
  UnsafeSetReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE, queueTotalSize);
}

// Streams spec, 3.12.10. ReadableByteStreamControllerError ( controller, e )
function ReadableByteStreamControllerError(controller, e) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: Assert: stream.[[state]] is "readable".
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_STATE_READABLE,
         "controller's stream should be in the readable state");

  // Step 3: Perform ! ReadableByteStreamControllerClearPendingPullIntos(controller).
  ReadableByteStreamControllerClearPendingPullIntos(controller);

  // Step 4: Perform ! ResetQueue(controller).
  ResetQueue(controller);

  // Step 5: Perform ! ReadableStreamError(stream, e).
  ReadableStreamError(stream, e);
}

// Streams spec, 3.12.11. ReadableByteStreamControllerFillHeadPullIntoDescriptor ( controler, size, pullIntoDescriptor )
function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size,
                                                                pullIntoDescriptor)
{
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Assert: either controller.[[pendingPullIntos]] is empty, or the
  //         first element of controller.[[pendingPullIntos]] is pullIntoDescriptor.
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  assert(pendingPullIntos.length === 0 || pendingPullIntos[0] === pullIntoDescriptor,
         "pullIntoDescriptor should be first pending pull into");

  // Step 2: Perform ! ReadableByteStreamControllerInvalidateBYOBRequest(controller).
  ReadableByteStreamControllerInvalidateBYOBRequest(controller);

  // Step 3: Set pullIntoDescriptor.[[bytesFilled]] to pullIntoDescriptor.[[bytesFilled]] + size.
  assert(size === size, "size must not be NaN");
  pullIntoDescriptor.bytesFilled += size;
}

// Streams spec, 3.12.12. ReadableByteStreamControllerFillPullIntoDescriptorFromQueue ( controller, pullIntoDescriptor )
function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let elementSize be pullIntoDescriptor.[[elementSize]].
  let elementSize = pullIntoDescriptor.elementSize;

  // Step 2: Let currentAlignedBytes be pullIntoDescriptor.[[bytesFilled]] −
  //         (pullIntoDescriptor.[[bytesFilled]] mod elementSize).
  let currentAlignedBytes = pullIntoDescriptor.bytesFilled -
                            (pullIntoDescriptor.bytesFilled % elementSize);

  // Step 3: Let maxBytesToCopy be min(controller.[[queueTotalSize]],
  //         pullIntoDescriptor.[[byteLength]] − pullIntoDescriptor.[[bytesFilled]]).
  let queueTotalSize = UnsafeGetInt32FromReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  let maxBytesToCopy = std_Math_min(queueTotalSize,
                                    pullIntoDescriptor.byteLength -
                                    pullIntoDescriptor.bytesFilled);

  // Step 4: Let maxBytesFilled be pullIntoDescriptor.[[bytesFilled]] + maxBytesToCopy.
  let maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;

  // Step 5: Let maxAlignedBytes be maxBytesFilled − (maxBytesFilled mod elementSize).
  let maxAlignedBytes = maxBytesFilled - (maxBytesFilled % elementSize);

  // Step 6: Let totalBytesToCopyRemaining be maxBytesToCopy.
  let totalBytesToCopyRemaining = maxBytesToCopy;

  // Step 7: Let ready be false.
  let ready = false;

  // Step 8: If maxAlignedBytes > currentAlignedBytes,
  if (maxAlignedBytes > currentAlignedBytes) {
    // Step a: Set totalBytesToCopyRemaining to maxAlignedBytes −
    //         pullIntoDescriptor.[[bytesFilled]].
    totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;

    // Step b: Let ready be true.
    ready = true;
  }

  // Step 9: Let queue be controller.[[queue]].
  let queue = UnsafeGetObjectFromReservedSlot(controller, QUEUE_CONTAINER_SLOT_QUEUE);

  // Step 10: Repeat the following steps while totalBytesToCopyRemaining > 0,
  while (totalBytesToCopyRemaining > 0) {
    assert(queue.length !== 0, "queue must not be empty if we have bytes to copy");

    // Step a: Let headOfQueue be the first element of queue.
    let headOfQueue = queue[0];

    // Step b: Let bytesToCopy be min(totalBytesToCopyRemaining,
    //                                headOfQueue.[[byteLength]]).
    let bytesToCopy = std_Math_min(totalBytesToCopyRemaining,
                                   headOfQueue.byteLength);

    // Step c: Let destStart be pullIntoDescriptor.[[byteOffset]] +
    //         pullIntoDescriptor.[[bytesFilled]].
    let destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;

    // Step d: Perform ! CopyDataBlockBytes(headOfQueue.[[buffer]].[[ArrayBufferData]],
    //                                      headOfQueue.[[byteOffset]],
    //                                      pullIntoDescriptor.[[buffer]].[[ArrayBufferData]],
    //                                      destStart, bytesToCopy).
    let sourceBuffer = headOfQueue.buffer;
    let sourceOffset = headOfQueue.byteOffset;
    let targetBuffer = pullIntoDescriptor.buffer;
    ArrayBufferCopyData(targetBuffer, destStart | 0,
                        sourceBuffer, sourceOffset | 0,
                        bytesToCopy | 0, false);

    // Step e: If headOfQueue.[[byteLength]] is bytesToCopy,
    if (headOfQueue.byteLength === bytesToCopy) {
      // Step i: Remove the first element of queue, shifting all other elements
      //         downward (so that the second becomes the first, and so on).
      ArrayStaticShift(queue);
    } else {
      // Step f: Otherwise,
      // Step i: Set headOfQueue.[[byteOffset]] to headOfQueue.[[byteOffset]] +
      //         bytesToCopy.
      headOfQueue.byteOffset += bytesToCopy;

      // Step ii: Set headOfQueue.[[byteLength]] to headOfQueue.[[byteLength]] −
      //          bytesToCopy.
      headOfQueue.byteLength -= bytesToCopy;
    }

    // Step g: Set controller.[[queueTotalSize]] to
    //         controller.[[queueTotalSize]] − bytesToCopy.
    queueTotalSize = UnsafeGetInt32FromReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
    queueTotalSize -= bytesToCopy;
    UnsafeSetReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE, queueTotalSize);

    // Step h: Perform ! ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller,
    //                                                                          bytesToCopy,
    //                                                                          pullIntoDescriptor).
    ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller,
                                                           bytesToCopy,
                                                           pullIntoDescriptor);

    // Step i: Set totalBytesToCopyRemaining to totalBytesToCopyRemaining − bytesToCopy.
    totalBytesToCopyRemaining -= bytesToCopy;
  }

  // Step 11: If ready is false,
  if (!ready) {
    // Step a: Assert: controller.[[queueTotalSize]] is 0.
    assert(UnsafeGetInt32FromReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE) === 0,
           "should have no queued bytes");

    // Step b: Assert: pullIntoDescriptor.[[bytesFilled]] > 0.
    assert(pullIntoDescriptor.bytesFilled > 0, "should have filled some bytes");

    // Step c: Assert: pullIntoDescriptor.[[bytesFilled]] <
    //         pullIntoDescriptor.[[elementSize]].
    assert(pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize,
           "if not ready, then should not have enough bytes for a single element");
  }

  // Step 12: Return ready.
  return ready;
}

// Streams spec 3.12.13. ReadableByteStreamControllerGetDesiredSize ( controller )
function ReadableByteStreamControllerGetDesiredSize(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on a ReadableByteStreamController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);

  // Step 2: Let state be stream.[[state]].
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);

  // Step 3: If state is "errored", return null.
  if (state & READABLESTREAM_STATE_ERRORED)
    return null;

  // Step 4: If state is "closed", return 0.
  if (state & READABLESTREAM_STATE_CLOSED)
    return 0;

  // Step 5: Return controller.[[strategyHWM]] − controller.[[queueTotalSize]].
  let strategyHWM = UnsafeGetReservedSlot(controller, READABLESTREAMCONTROLLER_SLOT_STRATEGY_HWM);
  let queueSize = UnsafeGetReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  return strategyHWM - queueSize;
}

// Streams spec 3.12.14. ReadableByteStreamControllerHandleQueueDrain ( controller )
function ReadableByteStreamControllerHandleQueueDrain(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Assert: controller.[[controlledReadableStream]].[[state]] is "readable".
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");
  assert(UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE) &
         READABLESTREAM_STATE_READABLE,
         "controller's stream must be in the readable state");

  // Step 2: If controller.[[queueTotalSize]] is 0 and
  //         controller.[[closeRequested]] is true,
  let queueTotalSize = UnsafeGetInt32FromReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  let closeRequested = READABLESTREAMCONTROLLER_FLAGS(controller) &
                       READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED;
  if (queueTotalSize === 0 && closeRequested) {
    // Step a: Perform ! ReadableStreamClose(controller.[[controlledReadableStream]]).
    ReadableStreamClose(stream);
  } else {
    // Step 3: Otherwise,
    // Step a: Perform ! ReadableByteStreamControllerCallPullIfNeeded(controller).
    ReadableByteStreamControllerCallPullIfNeeded(controller);
  }
}

// Streams spec 3.12.15. ReadableByteStreamControllerInvalidateBYOBRequest ( controller )
function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: If controller.[[byobRequest]] is undefined, return.
  let byobRequest = UnsafeGetReservedSlot(controller,
                                          READABLEBYTESTREAMCONTROLLER_SLOT_BYOB_REQUEST);
  if (byobRequest === undefined)
    return;

  // Step 2: Set controller.[[byobRequest]].[[associatedReadableByteStreamController]]
  //         to undefined.
  UnsafeSetReservedSlot(byobRequest, READABLESTREAMBYOBREQUEST_SLOT_ASSOCIATED_READABLE_BYTESTREAM_CONTROLLER,
                        undefined);

  // Step 3: Set controller.[[byobRequest]].[[view]] to undefined.
  UnsafeSetReservedSlot(byobRequest, READABLESTREAMBYOBREQUEST_SLOT_VIEW, undefined);

  // Step 4: Set controller.[[byobRequest]] to undefined.
  UnsafeSetReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_BYOB_REQUEST, undefined);
}

// Streams spec 3.12.16. ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue ( controller )
function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Assert: controller.[[closeRequested]] is false.
  assert(!(READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED),
         "controller must not be closing");

  // Step 2: Repeat the following steps while controller.[[pendingPullIntos]]
  //         is not empty,
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  while (pendingPullIntos.length !== 0) {
    // Step a: If controller.[[queueTotalSize]] is 0, return.
    let queueTotalSize = UnsafeGetInt32FromReservedSlot(controller,
                                                        QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
    if (queueTotalSize === 0)
      return;

    // Step b: Let pullIntoDescriptor be the first element of
    //         controller.[[pendingPullIntos]].
    let pullIntoDescriptor = pendingPullIntos[0];

    // Step c: If ! ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)
    //         is true,
    if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller,
                                                                    pullIntoDescriptor))
    {
      // Step i: Perform ! ReadableByteStreamControllerShiftPendingPullInto(controller).
      ReadableByteStreamControllerShiftPendingPullInto(controller);

      // Step ii: Perform ! ReadableByteStreamControllerCommitPullIntoDescriptor(controller.[[controlledReadableStream]],
      //                                                                         pullIntoDescriptor).
      let stream =
          UnsafeGetObjectFromReservedSlot(controller,
                                          READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
      assert(IsReadableStream(stream), "controller should have a ReadableStream");
      ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
    }

    assert(pendingPullIntos ===
           UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS),
           "the pendingPullIntos list should not have been replaced");
  }
}

// Streams spec, 3.12.17. ReadableByteStreamControllerPullInto ( controller, view )
function ReadableByteStreamControllerPullInto(controller, view) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: Let elementSize be 1.
  let elementSize = 1;

  // Step 3: Let ctor be %DataView%.
  let ctor = GetBuiltinConstructor("DataView");

  // Step 4: If view has a [[TypedArrayName]] internal slot (i.e., it is not a
  //         DataView),
  if (IsTypedArray(view)) {
    // Step a: Set elementSize to the element size specified in the typed array
    //         constructors table for view.[[TypedArrayName]].
    // Step b: Set ctor to the constructor specified in the typed array
    //         constructors table for view.[[TypedArrayName]].
    ctor = _ConstructorForTypedArray(view);
    elementSize = 1 << TypedArrayElementShift(view);
  }

  // Step 5: Let pullIntoDescriptor be Record {[[buffer]]: view.[[ViewedArrayBuffer]],
  //                                           [[byteOffset]]: view.[[ByteOffset]],
  //                                           [[byteLength]]: view.[[ByteLength]],
  //                                           [[bytesFilled]]: 0,
  //                                           [[elementSize]]: elementSize,
  //                                           [[ctor]]: ctor,
  //                                           [[readerType]]: "byob"}.
  let buffer = TypedArrayBuffer(view);
  let byteOffset = UnsafeGetInt32FromReservedSlot(view, JS_TYPEDARRAYLAYOUT_BYTEOFFSET_SLOT);
  let byteLength = ArrayBufferByteLength(buffer);
  let pullIntoDescriptor = {
    __proto__: null,
    buffer,
    byteOffset,
    byteLength,
    bytesFilled: 0,
    elementSize,
    ctor,
    readerType: "byob"
  };

  // Step 6: If controller.[[pendingPullIntos]] is not empty,
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  if (pendingPullIntos.length !== 0) {
    // Step a: Set pullIntoDescriptor.[[buffer]] to
    //         ! SameRealmTransfer(pullIntoDescriptor.[[buffer]]).
    pullIntoDescriptor.buffer = SameRealmTransfer(pullIntoDescriptor.buffer);

    // Step b: Append pullIntoDescriptor as the last element of
    //         controller.[[pendingPullIntos]].
    ArrayStaticPush(pendingPullIntos, pullIntoDescriptor);

    // Step c: Return ! ReadableStreamAddReadIntoRequest(stream).
    return ReadableStreamAddReadIntoRequest(stream);
  }

  // Step 7: If stream.[[state]] is "closed",
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (state & READABLESTREAM_STATE_CLOSED) {
    // Step a: Let emptyView be ! Construct(ctor, pullIntoDescriptor.[[buffer]],
    //                                            pullIntoDescriptor.[[byteOffset]], 0).
    let emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);

    // Step b: Return a promise resolved with
    //         ! CreateIterResultObject(emptyView, true).
    return CreatePromiseResolvedWith({value: emptyView, done: true});
  }

  // Step 8: If controller.[[queueTotalSize]] > 0,
  let queueTotalSize = UnsafeGetInt32FromReservedSlot(controller, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  if (queueTotalSize > 0) {
    // Step a: If ! ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller,
    //                                                                          pullIntoDescriptor)
    //         is true,
    if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller,
                                                                    pullIntoDescriptor)) {
      // Step i: Let filledView be
      //         ! ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor).
      let filledView =
        ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);

      // Step ii: Perform ! ReadableByteStreamControllerHandleQueueDrain(controller).
      ReadableByteStreamControllerHandleQueueDrain(controller);

      // Step iii: Return a promise resolved with
      //           ! CreateIterResultObject(filledView, false).
      return CreatePromiseResolvedWith({value: filledView, done: false});
    }

    // Step b: If controller.[[closeRequested]] is true,
    if (READABLESTREAMCONTROLLER_FLAGS(controller) &
        READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED)
    {
      // Step i: Let e be a TypeError exception.
      let e = GetTypeError(JSMSG_READABLESTREAMCONTROLLER_CLOSED, "read");

      // Step ii: Perform ! ReadableByteStreamControllerError(controller, e).
      ReadableByteStreamControllerError(controller, e);

      // Step iii: Return a promise rejected with e.
      return CreatePromiseRejectedWith(e);
    }
  }

  // Step 9: Set pullIntoDescriptor.[[buffer]] to
  //         ! SameRealmTransfer(pullIntoDescriptor.[[buffer]]).
  pullIntoDescriptor.buffer = SameRealmTransfer(pullIntoDescriptor.buffer);

  // Step 10: Append pullIntoDescriptor as the last element of
  //          controller.[[pendingPullIntos]].
  ArrayStaticPush(pendingPullIntos, pullIntoDescriptor);

  // Step 11: Let promise be ! ReadableStreamAddReadIntoRequest(stream).
  let promise = ReadableStreamAddReadIntoRequest(stream);

  // Step 12: Perform ! ReadableByteStreamControllerCallPullIfNeeded(controller).
  ReadableByteStreamControllerCallPullIfNeeded(controller);

  // Step 13: Return promise.
  return promise;
}

// Streams spec 3.12.18. ReadableByteStreamControllerRespond( controller, bytesWritten )
function ReadableByteStreamControllerRespond(controller, bytesWritten) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let bytesWritten be ? ToNumber(bytesWritten).
  bytesWritten = ToNumber(bytesWritten);

  // Step 2: If ! IsFiniteNonNegativeNumber(bytesWritten) is false,
  if (!IsFiniteNonNegativeNumber(bytesWritten))
    ThrowRangeError(JSMSG_NUMBER_MUST_BE_FINITE_NON_NEGATIVE, "bytesWritten");

  // Step 3: Assert: controller.[[pendingPullIntos]] is not empty.
  assert(UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS).length !== 0,
         "controller must have at least one pending operation");

  // Step 4: Perform ? ReadableByteStreamControllerRespondInternal(controller, bytesWritten).
  ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
}

// Streams spec 3.12.19. ReadableByteStreamControllerRespondInClosedState( controller, firstDescriptor )
function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Set firstDescriptor.[[buffer]] to
  //         ! SameRealmTransfer(firstDescriptor.[[buffer]]).
  firstDescriptor.buffer = SameRealmTransfer(firstDescriptor.buffer);

  // Step 2: Assert: firstDescriptor.[[bytesFilled]] is 0.
  assert(firstDescriptor.bytesFilled === 0, "first descriptor should be empty");

  // Step 3: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 4: Repeat the following steps while
  //         ! ReadableStreamGetNumReadIntoRequests(stream) > 0,
  while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
    // Step a: Let pullIntoDescriptor be
    //         ! ReadableByteStreamControllerShiftPendingPullInto(controller).
    let pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);

    // Step b: Perform ! ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor).
    ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
  }
}

// Streams spec 3.12.20. ReadableByteStreamControllerRespondInReadableState( controller, bytesWritten, pullIntoDescriptor )
function ReadableByteStreamControllerRespondInReadableState(controller,
                                                            bytesWritten,
                                                            pullIntoDescriptor)
{
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: If pullIntoDescriptor.[[bytesFilled]] + bytesWritten > pullIntoDescriptor.[[byteLength]],
  //         throw a RangeError exception.
  if (pullIntoDescriptor.bytesFilled + bytesWritten > pullIntoDescriptor.byteLength)
    ThrowRangeError(JSMSG_READABLEBYTESTREAMCONTROLLER_INVALID_BYTESWRITTEN);

  // Step 2: Perform ! ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller,
  //                                                                          bytesWritten,
  //                                                                          pullIntoDescriptor).
  ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten,
                                                         pullIntoDescriptor);

  // Step 3: If pullIntoDescriptor.[[bytesFilled]] <
  //         pullIntoDescriptor.[[elementSize]], return.
  if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize)
    return;

  // Step 4: Perform ! ReadableByteStreamControllerShiftPendingPullInto(controller).
  ReadableByteStreamControllerShiftPendingPullInto(controller);

  // Step 5: Let remainderSize be pullIntoDescriptor.[[bytesFilled]] mod
  //         pullIntoDescriptor.[[elementSize]].
  let remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;

  // Step 6: If remainderSize > 0,
  if (remainderSize > 0) {
    // Step a: Let end be pullIntoDescriptor.[[byteOffset]] +
    //         pullIntoDescriptor.[[bytesFilled]].
    let end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;

    // Step b: Let remainder be ? CloneArrayBuffer(pullIntoDescriptor.[[buffer]],
    //                                             end − remainderSize,
    //                                             remainderSize, %ArrayBuffer%).
    let remainder = callFunction(ArrayBufferSlice, pullIntoDescriptor.buffer,
                                 end - remainderSize, end);

    // Step c: Perform ! ReadableByteStreamControllerEnqueueChunkToQueue(controller,
    //                                                                   remainder, 0,
    //                                                                   remainder.[[ByteLength]]).
    // Note: `remainderSize` is equivalent to remainder.[[ByteLength]].
    ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainderSize);
  }

  // Step 7: Set pullIntoDescriptor.[[buffer]] to
  //         ! SameRealmTransfer(pullIntoDescriptor.[[buffer]]).
  pullIntoDescriptor.buffer = SameRealmTransfer(pullIntoDescriptor.buffer);

  // Step 8: Set pullIntoDescriptor.[[bytesFilled]] to pullIntoDescriptor.[[bytesFilled]] −
  //         remainderSize.
  assert(remainderSize === remainderSize, "remainderSize must not be NaN");
  pullIntoDescriptor.bytesFilled -= remainderSize;

  // Step 9: Perform ! ReadableByteStreamControllerCommitPullIntoDescriptor(controller.[[controlledReadableStream]],
  //                                                                        pullIntoDescriptor).
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");
  ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);

  // Step 10: Perform ! ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller).
  ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
}

// Streams spec, 3.12.21. ReadableByteStreamControllerRespondInternal ( controller, bytesWritten )
function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let firstDescriptor be the first element of controller.[[pendingPullIntos]].
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  let firstDescriptor = pendingPullIntos[0];

  // Step 2: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 3: If stream.[[state]] is "closed",
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (state & READABLESTREAM_STATE_CLOSED) {
    // Step a: If bytesWritten is not 0, throw a TypeError exception.
    if (bytesWritten !== 0)
      ThrowTypeError(JSMSG_READABLESTREAMBYOBREQUEST_RESPOND_CLOSED);

    // Step b: Perform
    //         ! ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor).
    ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor);
  } else {
    // Step 4: Otherwise,
    // Step a: Assert: stream.[[state]] is "readable".
    assert(state & READABLESTREAM_STATE_READABLE, "stream should be readable");

    // Step b: Perform ? ReadableByteStreamControllerRespondInReadableState(controller,
    //                                                                      bytesWritten,
    //                                                                      firstDescriptor).
    ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten,
                                                       firstDescriptor);
  }
}

// Streams spec, 3.12.22. ReadableByteStreamControllerRespondWithNewView ( controller, view )
function ReadableByteStreamControllerRespondWithNewView(controller, view) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Assert: controller.[[pendingPullIntos]] is not empty.
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  assert(pendingPullIntos.length !== 0, "controller should have a pending request");

  // Step 2: Let firstDescriptor be the first element of controller.[[pendingPullIntos]].
  let firstDescriptor = pendingPullIntos[0];

  // Step 3: If firstDescriptor.[[byteOffset]] + firstDescriptor.[[bytesFilled]]
  //         is not view.[[ByteOffset]], throw a RangeError exception.
  let byteOffset = UnsafeGetInt32FromReservedSlot(view, JS_TYPEDARRAYLAYOUT_BYTEOFFSET_SLOT);
  if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== byteOffset)
    ThrowRangeError(JSMSG_READABLEBYTESTREAMCONTROLLER_INVALID_VIEW_OFFSET);

  // Step 4: If firstDescriptor.[[byteLength]] is not view.[[ByteLength]],
  //         throw a RangeError exception.
  let buffer = TypedArrayBuffer(view);
  let byteLength = ArrayBufferByteLength(buffer);
  if (firstDescriptor.byteLength !== byteLength)
    ThrowRangeError(JSMSG_READABLEBYTESTREAMCONTROLLER_INVALID_VIEW_SIZE);

  // Step 5: Set firstDescriptor.[[buffer]] to view.[[ViewedArrayBuffer]].
  firstDescriptor.buffer = buffer;

  // Step 6: Perform ? ReadableByteStreamControllerRespondInternal(controller,
  //                                                               view.[[ByteLength]]).
  ReadableByteStreamControllerRespondInternal(controller, byteLength);
}

// Streams spec, 3.12.23. ReadableByteStreamControllerShiftPendingPullInto ( controller )
function ReadableByteStreamControllerShiftPendingPullInto(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let descriptor be the first element of controller.[[pendingPullIntos]].
  // Step 2: Remove descriptor from controller.[[pendingPullIntos]], shifting
  //         all other elements downward (so that the second becomes the first,
  //         and so on).
  let pendingPullIntos =
    UnsafeGetObjectFromReservedSlot(controller, READABLEBYTESTREAMCONTROLLER_SLOT_PENDING_PULL_INTOS);
  let descriptor = ArrayStaticShift(pendingPullIntos);

  // Step 3: Perform ! ReadableByteStreamControllerInvalidateBYOBRequest(controller).
  ReadableByteStreamControllerInvalidateBYOBRequest(controller);

  // Step 4: Return descriptor.
  return descriptor;
}

// Streams spec, 3.12.24. ReadableByteStreamControllerShouldCallPull ( controller )
function ReadableByteStreamControllerShouldCallPull(controller) {
  assert(IsReadableByteStreamController(controller),
         "must operate on ReadableByteStreamController");

  // Step 1: Let stream be controller.[[controlledReadableStream]].
  let stream = UnsafeGetObjectFromReservedSlot(controller,
                                               READABLESTREAMCONTROLLER_SLOT_CONTROLLED_STREAM);
  assert(IsReadableStream(stream), "controller should have a ReadableStream");

  // Step 2: If stream.[[state]] is not "readable", return false.
  let state = UnsafeGetInt32FromReservedSlot(stream, READABLESTREAM_SLOT_STATE);
  if (!(state & READABLESTREAM_STATE_READABLE))
    return false;

  // Step 3: If controller.[[closeRequested]] is true, return false.
  if (READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_CLOSE_REQUESTED)
    return false;

  // Step 4: If controller.[[started]] is false, return false.
  if (!(READABLESTREAMCONTROLLER_FLAGS(controller) & READABLESTREAMCONTROLLER_FLAG_STARTED))
    return false;

  // Step 5: If ! ReadableStreamHasDefaultReader(stream) is true and
  //         ! ReadableStreamGetNumReadRequests(stream) > 0, return true.
  if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0)
    return true;

  // Step 6: If ! ReadableStreamHasBYOBReader(stream) is true and
  //         ! ReadableStreamGetNumReadIntoRequests(stream) > 0, return true.
  if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0)
    return true;

  // Step 7: If ! ReadableByteStreamControllerGetDesiredSize(controller) > 0,
  //         return true.
  if (ReadableByteStreamControllerGetDesiredSize(controller) > 0)
    return true;

  // Step 8: Return false.
  return false;
}

// Streams spec 5, Transform Streams
// TODO: Implement after spec stabilizes

// Streams spec 6.1.2, new ByteLengthQueuingStrategy ( { highWaterMark } )
// Implemented in C++.

// Streams spec 6.1.3.1. size ( chunk )
function ByteLengthQueuingStrategy_size(chunk) {
  // Step 1: Return ? GetV(chunk, "byteLength").
  return chunk.byteLength;
}

// Streams spec 6.2.2. new CountQueuingStrategy ( { highWaterMark } )
// Implemented in C++.

// Streams spec 6.2.3.1. size ()
function CountQueuingStrategy_size() {
  // Step 1: Return 1.
  return 1;
}

// Streams spec, 6.3.1. DequeueValue ( container ) nothrow
function DequeueValue(container) {
  // Step 1: Assert: container has [[queue]] and [[queueTotalSize]] internal
  //         slots.
  assert(IsReadableStreamDefaultController(container) ||
         IsReadableByteStreamController(container),
         "DequeueValue can only operate on queue containers.");

  // Step 2: Assert: queue is not empty.
  var queue = UnsafeGetObjectFromReservedSlot(container, QUEUE_CONTAINER_SLOT_QUEUE);
  assert(queue.length !== 0, "queue must not be empty");

  // Step 3. Let pair be the first element of queue.
  // Step 4. Remove pair from queue, shifting all other elements downward
  //         (so that the second becomes the first, and so on).
  var pair = ArrayStaticShift(queue);

  // Step 5: Set container.[[queueTotalSize]] to
  //         container.[[queueTotalSize]] − pair.[[size]].
  // Step 6: If container.[[queueTotalSize]] < 0, set
  //         container.[[queueTotalSize]] to 0.
  //         (This can occur due to rounding errors.)
  var totalSize = UnsafeGetReservedSlot(container, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  totalSize -= pair.size;
  if (totalSize < 0)
    totalSize = 0;
  UnsafeSetReservedSlot(container, QUEUE_CONTAINER_SLOT_TOTAL_SIZE, totalSize);

  // Step 7: Return pair.[[value]].
  return pair.value;
}

// Streams spec, 6.3.2. EnqueueValueWithSize ( container, value, size ) throws
function EnqueueValueWithSize(container, value, size) {
  // Step 1: Assert: container has [[queue]] and [[queueTotalSize]] internal
  //         slots.
  assert(IsReadableStreamDefaultController(container) ||
         IsReadableByteStreamController(container),
         "EnqueueValueWithSize can only operate on queue containers.");

  // Step 2: Let size be ? ToNumber(size).
  size = ToNumber(size);

  // Step 3: If ! IsFiniteNonNegativeNumber(size) is false, throw a RangeError
  //         exception.
  if (!IsFiniteNonNegativeNumber(size))
    ThrowRangeError(JSMSG_NUMBER_MUST_BE_FINITE_NON_NEGATIVE, "size");

  // Step 4: Append Record {[[value]]: value, [[size]]: size} as the last element
  //         of container.[[queue]].
  var queue = UnsafeGetObjectFromReservedSlot(container, QUEUE_CONTAINER_SLOT_QUEUE);
  ArrayStaticPush(queue, {value, size});

  // Step 5: Set container.[[queueTotalSize]] to
  //         container.[[queueTotalSize]] + size.
  var totalSize = UnsafeGetReservedSlot(container, QUEUE_CONTAINER_SLOT_TOTAL_SIZE);
  totalSize += size;
  UnsafeSetReservedSlot(container, QUEUE_CONTAINER_SLOT_TOTAL_SIZE, totalSize);
}

// Streams spec, 6.3.3. PeekQueueValue ( container ) nothrow
function PeekQueueValue(container) {
  // Step 1: Assert: container has [[queue]] and [[queueTotalSize]] internal
  //         slots.
  assert(IsReadableStreamDefaultController(container) ||
         IsReadableByteStreamController(container),
         "DequeueValue can only operate on queue containers.");

  // Step 2: Assert: queue is not empty.
  var queue = UnsafeGetObjectFromReservedSlot(container, QUEUE_CONTAINER_SLOT_QUEUE);
  assert(queue.length !== 0, "queue must not be empty");

  // Step 3: Let pair be the first element of container.[[queue]].
  // Step 4: Return pair.[[value]].
  return queue[0].value;
}

// Streams spec, 6.3.4. ResetQueue ( container ) nothrow
function ResetQueue(container) {
  // Step 1: Assert: container has [[queue]] and [[queueTotalSize]] internal
  //         slots.
  assert(IsReadableStreamDefaultController(container) ||
         IsReadableByteStreamController(container),
         "ResetQueue can only operate on queue containers.");

  // Step 2: Set container.[[queue]] to a new empty List.
  UnsafeSetReservedSlot(container, QUEUE_CONTAINER_SLOT_QUEUE, new List());

  // Step 3: Set container.[[queueTotalSize]] to 0.
  UnsafeSetReservedSlot(container, QUEUE_CONTAINER_SLOT_TOTAL_SIZE, 0);
}

// Streams spec, 6.4.1. InvokeOrNoop ( O, P, args )
// TODO: Inline this, either manually or with an inlineable intrinsic.
function InvokeOrNoop(O, P, args) {
  // Step 1: Assert: P is a valid property key.
  assert(IsPropertyKey(P), "P is a valid property key");

  // Step 2: If args was not passed, let args be a new empty List (implicit).

  // Step 3: Let method be ? GetV(O, P).
  var method = O[P];

  // Step 4: If method is undefined, return.
  if (method === undefined)
    return undefined; // Return value required by eslint.

  // Step 5: Return ? Call(method, O, args).
  return FUN_APPLY(method, O, args);
}

// Streams spec, 6.4.2. IsFiniteNonNegativeNumber ( v )
function IsFiniteNonNegativeNumber(v) {
  // Step 1: If v is NaN, return false.
  if (Number_isNaN(v))
    return false;

  // Step 2: If v is +infinity, return false.
  if (!Number_isFinite(v))
    return false;

  // Step 3: If v < 0, return false.
  // Step 4: Return true.
  return v >= 0;
}

// Streams spec, 6.4.3. PromiseInvokeOrNoop ( O, P, args )
function PromiseInvokeOrNoop(O, P, args) {
  // Step 1: Assert: O is not undefined.
  assert(O !== undefined, "Receiver for PromiseInvokeOrNoop must not be undefined");

  // Step 2: Assert: ! IsPropertyKey(P) is true.
  assert(IsPropertyKey(P), "P is a valid property key");

  // Step 3: Assert: args is a List.
  // Omitted. This is annoying to test and doesn't gain us much.

  // Step 4: Let returnValue be InvokeOrNoop(O, P, args).
  try {
    let returnValue = InvokeOrNoop(O, P, args);
    // Step 6 (reordered): Otherwise, return a promise resolved with
    //                     returnValue.[[Value]].
    return CreatePromiseResolvedWith(returnValue);
  } catch (e) {
    // Step 5: If returnValue is an abrupt completion, return a promise
    //         rejected with returnValue.[[Value]].
    return CreatePromiseRejectedWith(e);
  }
}

function SameRealmTransfer(O) {
  return TransferBuffer(O, O);
}

// Streams spec, 6.4.4. ValidateAndNormalizeHighWaterMark ( highWaterMark )
function ValidateAndNormalizeHighWaterMark(highWaterMark) {
  // Step 1: Set highWaterMark to ? ToNumber(highWaterMark).
  highWaterMark = ToNumber(highWaterMark);

  // Step 2: If highWaterMark is NaN, throw a TypeError exception.
  // Step 3: If highWaterMark < 0, throw a RangeError exception.
  if (Number_isNaN(highWaterMark) || highWaterMark < 0)
    ThrowRangeError(JSMSG_STREAM_INVALID_HIGHWATERMARK);

  // Step 4: Return highWaterMark.
  return highWaterMark;
}

// Streams spec, 6.4.5. ValidateAndNormalizeQueuingStrategy ( size, highWaterMark )
function ValidateAndNormalizeQueuingStrategy(size, highWaterMark) {
  // Step 1: If size is not undefined and ! IsCallable(size) is false, throw a
  //         TypeError exception.
  if (size !== undefined && !IsCallable(size))
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, size));

  // Step 2: Let highWaterMark be ? ValidateAndNormalizeHighWaterMark(highWaterMark).
  highWaterMark = ValidateAndNormalizeHighWaterMark(highWaterMark);

  // Step 3: Return Record {[[size]]: size, [[highWaterMark]]: highWaterMark}.
  return {__proto__: null, size, highWaterMark};
}
