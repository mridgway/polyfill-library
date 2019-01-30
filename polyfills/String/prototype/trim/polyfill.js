/* global CreateMethodProperty, TrimStart */
// 21.1.3.27. String.prototype.trim ( )
CreateMethodProperty(String.prototype, 'trim', function trim() {
	// Let S be this value.
	var S = this;
	// Return ? TrimString(S, "start+end").
	return TrimStart(S, "start+end");
});
