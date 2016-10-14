const fs = require('fs');
const list = fs.readFileSync('./vanity-bodge.txt', 'utf8').split('\n');
const fetch = require('node-fetch')

const urlmgmturl = 'https://url-management-api.in.ft.com/api';


Promise.all(list.map(it => {
	let [src, dest, type] = it.split('\t');
	if (!type) {
		return Promise.reject(`no type for ${it}`);
	}

	const code = type.toLowerCase() === 'redirect' ? 301 : type.toLowerCase() === 'vanity' ? 100 : null;
	if (!code) {
		return Promise.reject(`not a valid type for ${it}`);
	}

	if (dest.charAt(0) !== '/' && !/^https?:\/\/www\.ft\.com/.test(dest)) {
		return Promise.reject(`url not supported by vanities yet for ${it}`)
	}

	src = src.replace(/^(\/|https?:\/\/www\.ft\.com\/)/, 'https://www.ft.com/')
	dest = dest.replace(/^(\/|https?:\/\/www\.ft\.com\/)/, 'https://www.ft.com/')

	console.log(`Will ${code} ${src} to ${dest}`)
	return fetch(urlmgmturl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'FT-Authorization': process.env.FT_NEXT_BACKEND_KEY
      },
      body: JSON.stringify(
          {
          	fromURL: src,
          	toURL: dest,
          	code: code,
          	operation: 'PUT',
          	mode: 'insert_or_update'
          }
      )
    })
			.then(res => res.json())
			.then(res => console.log(`applied ${code} ${src} to ${dest}`))
})
	.map(p => p.catch(e => console.log(e))))
