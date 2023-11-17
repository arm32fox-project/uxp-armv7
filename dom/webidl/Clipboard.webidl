/* -*- Mode: IDL; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * The origin of this IDL file is
 * http://www.w3.org/TR/geolocation-API
 *
 * Copyright © 2018 W3C® (MIT, ERCIM, Keio), All Rights Reserved. W3C
 * liability, trademark and document use rules apply.
 */


[SecureContext, Exposed=Window, Pref="dom.events.asyncClipboard"]
interface Clipboard : EventTarget {
  [Pref="dom.events.asyncClipboard.dataTransfer", Throws, NeedsSubjectPrincipal]
  Promise<DataTransfer> read();
  [Throws, NeedsSubjectPrincipal]
  Promise<DOMString> readText();
  [Pref="dom.events.asyncClipboard.dataTransfer", Throws, NeedsSubjectPrincipal]
  Promise<void> write(DataTransfer data);
  [Throws, NeedsSubjectPrincipal]
  Promise<void> writeText(DOMString data);
};


// Note: The spec uses ClipboardItemData instead of Blob.
//       All current implementers however use Blob. Spec change needed.
// typedef (DOMString or Blob) ClipboardItemDataType;
// typedef Promise<ClipboardItemDataType> ClipboardItemData;
// callback ClipboardItemDelayedCallback = ClipboardItemData ();

[Constructor(record<DOMString, Blob> items, optional ClipboardItemOptions options),
 SecureContext, Exposed=Window, Pref="dom.events.asyncClipboard.clipboardItem"]
interface ClipboardItem {
  // NYI:
  // static ClipboardItem createDelayed(
  //     record<DOMString, ClipboardItemDelayedCallback> items,
  //     optional ClipboardItemOptions options = {});

  readonly attribute PresentationStyle presentationStyle;
  // NYI:
  // readonly attribute long long lastModified;
  // readonly attribute boolean delayed;

  // TODO: Use FrozenArray once available. (Bug 1236777)
  // readonly attribute FrozenArray<DOMString> types;
  [Frozen, Cached, Pure]
  readonly attribute sequence<DOMString> types;

  [Throws]
  Promise<Blob> getType(DOMString type);
};

enum PresentationStyle { "unspecified", "inline", "attachment" };

dictionary ClipboardItemOptions {
  PresentationStyle presentationStyle = "unspecified";
};
