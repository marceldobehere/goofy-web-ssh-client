const term = new Terminal();
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
term.write('Click Connect to connect to a websocket ssh server!\r\n');

term.prompt = () => {
    
};

term.onData(e => {
    console.log(e);
    if (e == '\r')
    {
        //term.prompt();
    }
    else if (e == "[15~")
    {
        window.reload();
    }
    else
        ;//term.write(e);
});


term.prompt();
term._initialized = true;
term.focus();

let libssh2;
let ws, ch;
let has_opened = false;

ssh2Loader().then((wasm) => {
	libssh2 = wasm;
	libssh2.init(0);
});

function doconn()
{
	fitAddon.fit();

	if(typeof(libssh2) === 'undefined') {
		return term.write('libsh2 load failed\r\n');
	}

	if(has_opened) {
		ws.close();
		delete ws;
		has_opened = false;
		document.getElementById('connect').value = 'connect';
		return term.write('\r\nstream disconnected\r\n');
	}
	else {
		const url = document.getElementById('url').value;
		ws = new WebSocket(url);

		session = libssh2.createSESSION(ws, (rc, err)=> {
			if(rc !== libssh2.ERROR.NONE) {
				return term.write(`createSESSION error ${rc} ${msg}`);
			}

			term.write('stream connected\r\n');
			term.focus();

			has_opened = true;
			document.getElementById('connect').value = 'disconnect';
			
			setTimeout(() => {
				term.write('Fingerprint: ' +
					session.fingerprint() + '\r\n');
				dologin();
			},50);
		});
	}
}

function dologin() 
{
	term.write('login as: ');

	let user  = '';
	let passwd= '';
	let mode = 0;
	let stop = false;
	term.onData((c) => {
		if(stop)
			return;
		else if(mode === 0) {
			if (c.charCodeAt(0) === 127) { // 	'\b'
				if(user.length >= 1) {
					user = user.substring(0, user.length-1);
					term.write('\x1b[D');
					term.write('\x1b[K');
				}
			}
			else if(c.charCodeAt(0) === 13) { // 	'\n
				if(user.length === 0) {
					term.write('\r\nlogin as: ');
				}
				else {
					mode++;
					term.write('\r\n'+user+"'s password: ");
				}
			}
			else {
				user += c;
				term.write(c);
			}
		}
		else if(mode === 1) {
			if (c.charCodeAt(0) === 127) { //	'\b'
				if(passwd.length >= 1) {
					passwd=passwd.substring(0,passwd.length-1);
					term.write('\x1b[D');
					term.write('\x1b[K');
				}
			}
			else if(c.charCodeAt(0) === 13) { //	'\n'
				mode++;
				term.write('\r\n');
			}
			else {
				passwd += c;
				term.write('*');
			}
		}

		if(mode === 2) {
			stop = true;
			session.login(user, passwd, (rc, msg) => {
				console.log(rc, msg);
				if(rc === libssh2.ERROR.NONE) {
					doshell()
				}
				else {
					term.write('Access denied ');
					term.write(`${rc} ${msg}\r\n`);

					stop = false;
					mode = 1;
					passwd = '';
					term.write(`${user}'s password: `);
				}
			});
		}

	});
}

function doshell() 
{
	term.onData((c) => {
		ch.send(c);
	});

	session.CHANNEL((rc, _ch) => {
		if(rc !== libssh2.ERROR.NONE) {
			return term.write(`channel error ${rc}, ${msg}\r\n`);
		}

		ch = _ch;
		ch.onmessage((rc, msg) => {
			term.write(msg);
		});
		ch.shell((rc, msg) => {
			console.log(rc, msg);
			if(rc !== libssh2.ERROR.NONE) {
				return term.write(`shell error ${rc}, ${msg}\r\n`);
			}

			ch.pty_size(term.cols, term.rows, (rc, msg) => {
				console.log(`pty_size: ${rc}, ${msg}`);
			});
		});
	});
}