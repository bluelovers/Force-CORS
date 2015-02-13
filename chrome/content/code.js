function Forcecors()
{
	//this.enabled = false;

	this.prefs = Components.classes['@mozilla.org/preferences-service;1']
		.getService(Components.interfaces.nsIPrefBranch);

	try
	{
		this.enabled = this.prefs.getBoolPref('extensions.forcecors.enabled');
	}
	catch (e)
	{
		this.prefs.setBoolPref('extensions.forcecors.enabled', false);
		this.enabled = false;
	}

	this.observer = {
		observe: function(subject, topic, data)
		{
			if (topic == 'http-on-examine-response')
			{
				var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
				var headers = Forcecors.getHeaders();
				for (var i = 0; i < headers.length; i++)
				{
					var keyValue = headers[i].split(' ');
					httpChannel.setResponseHeader(keyValue[0], keyValue[1], false);
				}
			}
		}
	};
};

Forcecors.prototype.getHeaders = function()
{
	/*
	var prefs = Components.classes['@mozilla.org/preferences-service;1']
		.getService(Components.interfaces.nsIPrefBranch);
	*/

	try
	{
		var headers = this.prefs.getCharPref('extensions.forcecors.headers');
	}
	catch (e)
	{
		var headers = this.prefs.getCharPref('forcecors.headers');

		this.prefs.setCharPref('extensions.forcecors.headers', headers);
	}

	if (headers != null)
	{
		if (headers.indexOf('|') === -1)
		{
			// migrate old config
			headers = headers.replace(/ /, '|');
			headers = headers.replace(/:/, ' ');
			this.prefs.setCharPref('extensions.forcecors.headers', headers);
		}
		return headers.split('|');
	}
	return [];
};

Forcecors.prototype.updateLabel = function()
{
	var btn = document.getElementById('forcecors-button');
	if (this.enabled)
	{
		btn.label = 'CORS';
		btn.tooltipText = 'CORS is currently forced';
		btn.className = (btn.className || '') + ' enabled';
	}
	else
	{
		btn.label = 'cors';
		btn.tooltipText = 'click to force CORS';
		btn.className = btn.className.replace(/\benabled\b/ig, '');
	}
};

Forcecors.prototype.toggle = function(bool)
{
	var os = Components.classes["@mozilla.org/observer-service;1"]
		.getService(Components.interfaces.nsIObserverService);

	bool = (typeof bool === 'boolean' ? bool : !this.enabled);

	try
	{
		if (this.enabled)
		{
			os.removeObserver(this.observer, "http-on-examine-response");
		}
	}
	catch (e)
	{
		console.error(e);
	}

	try
	{
		if (bool)
		{
			os.addObserver(this.observer, "http-on-examine-response", false);
		}
	}
	catch (e)
	{
		console.error(e);
	}

	//this.enabled = !this.enabled;
	this.enabled = bool;
	this.updateLabel();

	this.prefs.setBoolPref('extensions.forcecors.enabled', this.enabled);
};

Forcecors = new Forcecors();

window.addEventListener('DOMContentLoaded', function()
{
	//Forcecors.updateLabel();
	Forcecors.toggle(Forcecors.enabled);
}, false);
