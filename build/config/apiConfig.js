var h=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var _=h((Y,T)=>{T.exports={name:"dotenv",version:"16.4.5",description:"Loads environment variables from .env file",main:"lib/main.js",types:"lib/main.d.ts",exports:{".":{types:"./lib/main.d.ts",require:"./lib/main.js",default:"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},scripts:{"dts-check":"tsc --project tests/types/tsconfig.json",lint:"standard","lint-readme":"standard-markdown",pretest:"npm run lint && npm run dts-check",test:"tap tests/*.js --100 -Rspec","test:coverage":"tap --coverage-report=lcov",prerelease:"npm test",release:"standard-version"},repository:{type:"git",url:"git://github.com/motdotla/dotenv.git"},funding:"https://dotenvx.com",keywords:["dotenv","env",".env","environment","variables","config","settings"],readmeFilename:"README.md",license:"BSD-2-Clause",devDependencies:{"@definitelytyped/dtslint":"^0.0.133","@types/node":"^18.11.3",decache:"^4.6.1",sinon:"^14.0.1",standard:"^17.0.0","standard-markdown":"^7.1.0","standard-version":"^9.5.0",tap:"^16.3.0",tar:"^6.1.11",typescript:"^4.8.4"},engines:{node:">=12"},browser:{fs:!1}}});var N=h((U,u)=>{var v=require("fs"),E=require("path"),b=require("os"),O=require("crypto"),V=_(),g=V.version,w=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function I(e){let t={},n=e.toString();n=n.replace(/\r\n?/mg,`
`);let o;for(;(o=w.exec(n))!=null;){let i=o[1],r=o[2]||"";r=r.trim();let s=r[0];r=r.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),s==='"'&&(r=r.replace(/\\n/g,`
`),r=r.replace(/\\r/g,"\r")),t[i]=r}return t}function A(e){let t=D(e),n=c.configDotenv({path:t});if(!n.parsed){let s=new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);throw s.code="MISSING_DATA",s}let o=y(e).split(","),i=o.length,r;for(let s=0;s<i;s++)try{let a=o[s].trim(),l=k(n,a);r=c.decrypt(l.ciphertext,l.key);break}catch(a){if(s+1>=i)throw a}return c.parse(r)}function R(e){console.log(`[dotenv@${g}][INFO] ${e}`)}function S(e){console.log(`[dotenv@${g}][WARN] ${e}`)}function f(e){console.log(`[dotenv@${g}][DEBUG] ${e}`)}function y(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function k(e,t){let n;try{n=new URL(t)}catch(a){if(a.code==="ERR_INVALID_URL"){let l=new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw l.code="INVALID_DOTENV_KEY",l}throw a}let o=n.password;if(!o){let a=new Error("INVALID_DOTENV_KEY: Missing key part");throw a.code="INVALID_DOTENV_KEY",a}let i=n.searchParams.get("environment");if(!i){let a=new Error("INVALID_DOTENV_KEY: Missing environment part");throw a.code="INVALID_DOTENV_KEY",a}let r=`DOTENV_VAULT_${i.toUpperCase()}`,s=e.parsed[r];if(!s){let a=new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${r} in your .env.vault file.`);throw a.code="NOT_FOUND_DOTENV_ENVIRONMENT",a}return{ciphertext:s,key:o}}function D(e){let t=null;if(e&&e.path&&e.path.length>0)if(Array.isArray(e.path))for(let n of e.path)v.existsSync(n)&&(t=n.endsWith(".vault")?n:`${n}.vault`);else t=e.path.endsWith(".vault")?e.path:`${e.path}.vault`;else t=E.resolve(process.cwd(),".env.vault");return v.existsSync(t)?t:null}function m(e){return e[0]==="~"?E.join(b.homedir(),e.slice(1)):e}function j(e){R("Loading env from encrypted .env.vault");let t=c._parseVault(e),n=process.env;return e&&e.processEnv!=null&&(n=e.processEnv),c.populate(n,t,e),{parsed:t}}function x(e){let t=E.resolve(process.cwd(),".env"),n="utf8",o=!!(e&&e.debug);e&&e.encoding?n=e.encoding:o&&f("No encoding is specified. UTF-8 is used by default");let i=[t];if(e&&e.path)if(!Array.isArray(e.path))i=[m(e.path)];else{i=[];for(let l of e.path)i.push(m(l))}let r,s={};for(let l of i)try{let d=c.parse(v.readFileSync(l,{encoding:n}));c.populate(s,d,e)}catch(d){o&&f(`Failed to load ${l} ${d.message}`),r=d}let a=process.env;return e&&e.processEnv!=null&&(a=e.processEnv),c.populate(a,s,e),r?{parsed:s,error:r}:{parsed:s}}function L(e){if(y(e).length===0)return c.configDotenv(e);let t=D(e);return t?c._configVault(e):(S(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`),c.configDotenv(e))}function $(e,t){let n=Buffer.from(t.slice(-64),"hex"),o=Buffer.from(e,"base64"),i=o.subarray(0,12),r=o.subarray(-16);o=o.subarray(12,-16);try{let s=O.createDecipheriv("aes-256-gcm",n,i);return s.setAuthTag(r),`${s.update(o)}${s.final()}`}catch(s){let a=s instanceof RangeError,l=s.message==="Invalid key length",d=s.message==="Unsupported state or unable to authenticate data";if(a||l){let p=new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw p.code="INVALID_DOTENV_KEY",p}else if(d){let p=new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw p.code="DECRYPTION_FAILED",p}else throw s}}function K(e,t,n={}){let o=!!(n&&n.debug),i=!!(n&&n.override);if(typeof t!="object"){let r=new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw r.code="OBJECT_REQUIRED",r}for(let r of Object.keys(t))Object.prototype.hasOwnProperty.call(e,r)?(i===!0&&(e[r]=t[r]),o&&f(i===!0?`"${r}" is already defined and WAS overwritten`:`"${r}" is already defined and was NOT overwritten`)):e[r]=t[r]}var c={configDotenv:x,_configVault:j,_parseVault:A,config:L,decrypt:$,parse:I,populate:K};u.exports.configDotenv=c.configDotenv;u.exports._configVault=c._configVault;u.exports._parseVault=c._parseVault;u.exports.config=c.config;u.exports.decrypt=c.decrypt;u.exports.parse=c.parse;u.exports.populate=c.populate;u.exports=c});N().config();module.exports={baseURL:process.env.BASE_URL||"localhost",port:process.env.PORT||3e3,prefix:"/api",rateLimit:{windowMs:15*60*1e3,max:450},corsOptions:{origin:"*",methods:"GET,HEAD,PUT,PATCH,POST,DELETE",preflightContinue:!1,optionsSuccessStatus:204},teamspeak:{Host:process.env.TS_HOST||"127.0.0.1",QueryPort:process.env.TS_QUERY_PORT||10011,ServerPort:process.env.TS_SERVER_PORT||9987,Username:process.env.TS_USERNAME||"serveradmin",Password:process.env.TS_PASSWORD,Nickname:process.env.TS_NICKNAME||"serveradmin"}};
//# sourceMappingURL=apiConfig.js.map
