var modbot = (function() {
	var username = 'new user';

	function greeting() {
		return 'hello there, ' + username + '!';
	}

	return {
		greeting: greeting
	};
})();

exports.modbot = modbot;