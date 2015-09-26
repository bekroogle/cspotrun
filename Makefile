chrome: index
	chromium-browser index.html

ff: index
	firefox-bin index.html

index: index.haml
	haml index.haml index.html
