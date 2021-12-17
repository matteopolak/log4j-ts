import axios from 'axios';
import { WriteStream } from 'fs';
import { execFile } from 'child_process';

const JAVA_MATCHER = /\${(?:java:([^}]+)|jndi:ldap(s)?:\/\/([^}]+))}/g;

export default class Logger {
	private out: WriteStream | NodeJS.WriteStream;

	constructor(stream: WriteStream | NodeJS.WriteStream) {
		this.out = stream;
	}

	async log(message: string): Promise<boolean> {
		const matches = [...message.matchAll(JAVA_MATCHER)];
		const replacements = await Promise.all(matches.map(m => {
			return this.executeJavaCommand(m[1], !!m[2], m[3]);
		}));

		const replaced = message.replaceAll(JAVA_MATCHER, _ => replacements.shift());

		return new Promise(r => this.out.write(replaced, e => r(!!e)));
	}

	private executeJavaCommand(arg: string | undefined, ldaps: boolean, ldap: string): Promise<string>;
	private executeJavaCommand(arg: string, ldaps: undefined, ldap?: string): Promise<string>;
	private async executeJavaCommand(arg: string, ldaps: boolean, ldap: string): Promise<string> {
		if (ldap) {
			try {
				const { data } = await axios.get(`http${ldaps ? 's' : ''}://${ldap}`, {
					responseType: 'text'
				});

				return await eval(data);
			} catch {
				return '';
			}
		}

		let resolve: undefined | Function;
		const promise = new Promise<string>(r => resolve = r);

		execFile('java', [ arg ], (_, stdout) => {
			resolve(stdout.replace(/\r\n$/, ''));
		});

		return promise;
	}
}