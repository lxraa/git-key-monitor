const lodash = require("lodash");
const crypto = require("crypto");
const axios = require("axios");

class Alipay{
	constructor(appid,private_key,public_key){
		this.appid = appid;
		this.private_key = private_key;
		this.public_key = public_key;

		// this.base_params = [{"key":"app_id","value":this.appid},{"key":"charset","value":"utf-8"},{"key":"sign_type","value":"RSA2"},{"key":"version","value":"1.0"}];
		this.charset = "utf-8";
		this.base_params = [{"charset":"utf-8"},{"sign_type":"RSA2"},{"version":"1.0"},{"app_id":this.appid}];
	}

	sign(params){
		params = lodash.sortBy(params,[function(o){
			let k;
			Object.keys(o).forEach((key)=>{
				k = key;
			});
			return k;
		}]);
		let params_arr = [];
		for(let i of params){
			Object.keys(i).forEach((k)=>{
				params_arr.push(`${k}=${i[k] instanceof Object ? JSON.stringify(i[k]) : i[k]}`);
			});
		}
		let params_str = params_arr.join("&");

		let create_sign = crypto.createSign("RSA-SHA256");
		create_sign.update(params_str,this.charset);

		let sign_str = create_sign.sign(this.private_key,"base64");
		
		params.push({"sign":sign_str});
		let r_arr = [];
		for(let i of params){
			Object.keys(i).forEach((k)=>{
				r_arr.push(`${k}=${i[k] instanceof Object ? encodeURIComponent(JSON.stringify(i[k])) : encodeURIComponent(i[k])}`);
			});
		}

		return r_arr.join("&");
	}


	getFormatTime(){
		let date = new Date();
		let year = date.getFullYear();
		let month = lodash.padStart((date.getMonth() + 1).toString(),2,"0");
		let d = lodash.padStart(date.getDate().toString(),2,"0");
		let hours = lodash.padStart(date.getHours().toString(),2,"0");
		let minutes = lodash.padStart(date.getMinutes().toString(),2,"0");
		let seconds = lodash.padStart(date.getSeconds().toString(),2,"0");
		return `${year}-${month}-${d} ${hours}:${minutes}:${seconds}`;
	}

	async getShopList(){
		let params = [...this.base_params];
		params.push({"method":"alipay.offline.market.shop.batchquery"});
		params.push({"timestamp":this.getFormatTime()});
		params.push({"biz_content":{"page_no":"1"}});

		let params_str = this.sign(params);

		await axios({
			"method":"GET",
			"url":"https://openapi.alipay.com/gateway.do?"+params_str
		}).then(res=>{
			console.log(res.data);
		});

		
	}

}


if(!module.parent){

	// let alipay = new Alipay("2016061701528100","-----BEGIN PRIVATE KEY-----\nMIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKwWamgDoZ/ijhflRmyAnLP69Q+dngcc1J/SzBYenVVt0vfkr88fEJR2Mj0LKT/5XriA2OiSFNpcoD9VXdXc6oRuFTqcyb4nhEyVBTKSTGXDWBqnWSPVCMfQv4IoTmeuI+RhnTB/WTpR19Yyjyvxe+9j8k9DK631NyO6qHqFTj1tAgMBAAECgYAtBwB4jtqvdxwu7HLs2QonnbaZi2hZ/BU2bHWyI/iO7dmRu2i1DS/NaM/kYRM+BgXeyPf4gqCqMipL6A5Rcyh5aGlRRx+8jY/qtxKbQVOEP5VS5pLOjqqtDXg56cmNtK3AdBC2RADdaLEzFsnF0zBkLNd89ikiUPTq6FgPEcceAQJBANWO4sllxa8w1X3Ncm0Vl1vXT292JG9cA8DNM6uXWdN+cRsQbz2FcEVYLQ5m0TRLqYoAsFV2w3mwbkJmcSSNiY0CQQDOSaWg2yrZtwG0jFUi500xjn3E2W0h0dp0EfcIouC8UacU2WULvPT2AbliTvsuE8xP4wX5BXcFevJrnRyE6FthAkA3jkFPNUuVBLY1UPH4kMpcWQnQLELUOXK8gGV1uRzkGRuhd8gIkCMh1wt5mKPJ3/kN7pnw0cGOcahtW6sJYEytAkEAqGyw8jh/L+qfVc4N5MV83S09um7bD3XLKmFQlJiHbLot9HPacE8Coaiet4lMwz4e3kq5Iaw4lRzguMQ5+LnNgQJAbGPhFVsw/Z8iAo1VMMeN4wYt5a0thc6YarlldBagQSDNkGJCb65k8wPewxTmO4ZhW7KZJLHPz20QxdQp8ZfpYA==\n-----END PRIVATE KEY-----","-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCsFmpoA6Gf4o4X5UZsgJyz+vUPnZ4HHNSf0swWHp1VbdL35K/PHxCUdjI9Cyk/+V64gNjokhTaXKA/VV3V3OqEbhU6nMm+J4RMlQUykkxlw1gap1kj1QjH0L+CKE5nriPkYZ0wf1k6UdfWMo8r8XvvY/JPQyut9Tcjuqh6hU49bQIDAQAB\n-----END PUBLIC KEY-----");
	// let alipay = new Alipay("2018110562020163","-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCNyXWqh1+Xtrhz6vGunEr6N+t49XpW0VQV5cDK8PSanvXwLo8YHGQjExqETSuVLFxQ/d8DMV3xT7n7sQdWioy8XUyW5jiz34mRnkFJFeDHNruH64xExuy24i6L0a0M38doANbJcYtmQyF9Gt7yvRX2JQWmtOnZux1v7PxaTQs8OyftJQWub72n0JmfBTreuAJCkeL3+BRJOoIj726z761A3+/OC3YEL65ab0roW7vH74rHNi0uWF9HIfmWE+SNspJiHDjUB5L2/sKLHWC0dQX0aXyb+7PdlHzDMloy/YYkK1JsTHGsLhtrY+SkSKs9ZYOOvZxDRIhOCzdJ0c1iNZCBAgMBAAECggEAdvBIhISK6/mbQaIUmyUAwGWoYg+KUMnIf5X75EG87vfp11E3OEKYvdOIqvMRXFGaH1bXfRYseAEpQrl+LlqLNHgPh4YYiss5262llmmD5ZlENwCg6hD1AXU7Fo8NW39dByGtC87z4RTvQsMHwxhbE+B6nR2mDb+pMfrateVrR1oOCveOxjN2KshTL6yWS6zROKseuTHP0S0yj0CjkX81M9RBbkiehdwiknYtZ6thN9D/+3CqUT8Lu76n9FsqHTaRfTZQEmvZ+G4HImzFhz4DZyYaG5Zejc/Ne0g7JZb8375zg6uWHx4hS3IQFW2pZ+h/6bGkcMZB6GKk3dCB3cLEAQKBgQD2oLYikHy2MR+CrgYpe+yQDfV4p5l0viabeklMBt0ggJTtTdv3ZIZjPwuDSRB92tylLD8UdxLCbQTd4esGUj2gwfTPckvIFJz8PSnSa4dYYQnNV6cSSTmP7Qs/lsWHKS6XTC6N8Pi0Eups/tl2CYDIClOUsmFOJJOvFOrlgXU0rQKBgQCTLNEdPdPA/Wd85t1dHoiOC4BK2ka9VNoRS9T8cecB7wnLDpe+COM4HVxUcnmxGKYoTdlqqasaV9SF3BR19d2hN4Mj5vfJOaoyHIlGODkHG2BGWw1ucw8ZyTybJFRyD0ZAoQPXdmukPw10oZIU6n84TaVFGJYaDnmOdoQdAhuxpQKBgQCUxRs5PGlOSdGVNb6X1Z48w37YmlkSOAX38cs3JkjLa2TqxPW0hRof0g7y0ec11AkXRdqDUNSrHbI62iW4uXFdgMJZRLv75JtR+N86hAyvvlF4YbBxcmRbsoT/hcZ/otLtB1Jp4vtTPLnWp+CruE3L3ZbPcs8JoTzI91g+u1nlPQKBgFHMgflXqL7F2OPxyKz90HXqbIat5M1MQNuGIz2f7P4FJpNGbA5CEE/a+bsx2PMWORuDkUiYPrIoiMVRecnKOkFlgizNLYEY3MB3XdC6ZO/PRmY0KzXtG0KAt3+e5JR0at5235S8i71BEjB1sKSRZN4dQbMypBKdYvBMbMdWqZ/FAoGBAOe+HjO0EcDB7+X1qun4LsGyOV8womewFr7My1KKX9c28fZKk3+nHHYZ4ccDJbheVhe6Hn4YQXx35wTlY5NtoLToMvC1WPxXuPUzYQ+Jmy+/r6at6Ps+mf29crXgh+0pajTDGqdKfUvPuzv4+xyjGo3F5JpilWsv/4eDut3mhm+J\n-----END PRIVATE KEY-----","-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnF/UpvJ/z9AM37tY8g/GTbMZeTrKrb5dteO6TQdSnpcaIL8c4+lj6SFQq7B9Hmnz1wtKSD57IPCxXjWFQkyjHe5nMbRBiEV63/dO3OMA7nz4BMiFktEBCk1fSx8dG8nBHyn2lYvfOFLD1rT9WaqdJZlkEIk94Xl7BA5IsbeHcdeHfYULaW8NsEvZ/MsEAE14Klesoe9U1+hBpffZ9FBBc1/aLs9GyW5mMFI3aV37GQCx5X3EURILaKu7m/l/6E1be+J9LdnbvPhefzdVgrGlAmnGCG1vLTQczPRxemN4t/cJJc4P1U9OfPcRkQCRRsbZZBcF8O566FfFrpwG4IduowIDAQAB\n-----END PUBLIC KEY-----")
	// let alipay = new Alipay("2018010501610600","-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCVfkcDouEZAoqEdtFpH1PnitOc21L4hFd61i025y+Og++5Q0YY7UnRpQGy6FMdC8J8UgrA9kZbhKHkZdlLyDgSJZvglh0uhkm3qUC+IEX/PA7x12+4o3XMlOCkFM68Ij7EAMHVEFiysyZkk2lsKqBzCkIZz+ifS9gtq6hjPtDx0TbDLk4qQByRcRN60VhznmGWQ4Y2LIOu6Agbs+oOELACTJ2hBjeRT6mRXvKTd0CFTt4x7L3cJOYyCRa9N5a5UcGKXRme3Y0c1qOhE4ygICmKH/0P8wSIv8kDmBJ3d63z3/yzEmjeY9q8d/PnNdQ/1m39Vibs029HabbeKghC+HY9AgMBAAECggEANOgeBeFtPMazczIB5uxZa4asYcUVVjKwKx8FnXqwUAXNn4l5k3TXPUTilwi18X+p8wmuGKCQQe9sxEJvZuyTO4jn49H8vex0xnU2HpOZcj01JM4UEgp3tFG0Nx3OFLMh94g1EUzZt1TD77BkDQ4A/vXQcwYr08Sp22/3BjjDBfFzT5T96OZ2BMXw16MNRNCSiQwbxui2i3QJxuIowSA1KCpgL743pfeeFSiCZx8ZguO9VVdxj9Px+oePqqb2XYqrOJvrZFrvIio+sPZPqW6ucCgR4IBvyecGYHXu0aA16FWkm9iERVxPyckX42i4MwM54eX9W3iahp1mQmUvEKv/2QKBgQDhTcldw+2tlDKrY1XU9yPAsW92PX6a5QGgTZ2/pmz/D5X5XNvY56XMpVidHJE1/WbZYC1xPjoi1SqvnPtP6Bo9FFH9efFS755agrMVMP5o5sSkKl/o9qZRFd5OVPndwkAQLZJxnfzeefcbHzNAZXVdfqFPgJQaTnoUNtu+F1vthwKBgQCp3FjkU3dVD1hv2De2WQdiQAioQNutGM+AHwNXBpEDTfmttoIDUNIxXwFT5rZaVLkyK7y04jMPUQUNrU7JOpcGsAVe2dI09HNevQ+DBrFZhJ+OwK80nyihdO37D7d0k/NEeP5A9dPd+OWIci1RhYfLrP+YNPkL01f+qb18XqiPGwKBgEOzaRfY4Rmwl40ymz8USFUFvFWOYvXObK+rwwQs0UHPgCRfR9yktwiIgtkrFWNg0r/tC5qktTl0TpBYnpfDSecirQR62Q4v3Kib744lm70P4vTlms5ZF170MEnfdPmy/iceWovzimGbyqoGtRLbqem/PF+0ZkyFWl+qoFs9j60PAoGBAJO994dpXdMbTNXDX/n4B+caQS1vdGNjwB/1WadZK8qPCQtiQkV2B80vkG0UsClzpb2Qs0s1sCmzU8zooC2BC5migplUpnSu5qZRlWtm590v8MRurjX79ZAxr0j/C5eXlDFLeAKyjzxz39nFTcupdErgx1PxR2lUwyXbJ9hEUSJfAoGBAN0pGPdi6o9K5rZgtepFsaytwOl+6ZDzwxabJ//gsnTgHsJFCPDkJUalzGK5+C9hMiGH2jNG1+hGMpefM2CCTF4ZvPTNLwHWItCVczTmFdX0Rb9AHyPok6KlOm7UyWX21H2rLAztWB5i2nsdxrztyREYBG9Q+nXVlgTXw3kfMofH\n-----END PRIVATE KEY-----","-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkLh3z9s1U27ZioFogmysG8vuMQ78qWn7odkkD/1q9bvTj/u+Z6ePrWLRmN3rzYaQa4iUDem6cF/Hc/b+XCB9qAAJDPl06i4getRhMYm9ppSl446yKzPpjxl6qA6k68ES7FyAkxnp9A6lktP/H0hH6p4xzIhlMHWleATW1PkXYq74artp7BOKnToq8yiXLIx5N9RIzsF3eVkpwfXgNAJvUYb5IY4HsetII2P00tyDPmOq8QCUOdVE+Vqu4GrtMjQEJ+wwQ/yAVoJ2fqAzf83aK3o1VpvWgcrvkxj/Prkprc+TN0vhm5eEPWl73ZQWdgrY75mw8FdhOxYMGuDkqUjZRwIDAQAB\n-----END PUBLIC KEY-----")
	
	// let alipay = new Alipay("2016091200490273","-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDaJs39c3i+Sphcs3YPy2AppHFUWC9Aii5qZoIn3LqAlRcGeuoDuit8H4Nckf7rUjeJeByCJGF4wbZlN1a4kQwOYkpth13PXJDoqaHUy8cEbvBi+FzNUNoiyqF0ThaC3Q3zc1r5wY6+GjIpF5sqimnz548hjCmAzwh/4XKKpR0NYiPBjY90SnVeWX7WDxjnVc8qCg2ckAQ3Zl0OR9WldmeZYWOIn2gkKgM9akF6RE1ktr49P5P1QkbyMyMAH8J6zCNaS8LiRnjPcTN2soxDnR2J7c9owW7U+DaiVRYe9v38qqoX+lKIh3xQVbu+sVj718ADI/oFQLxwLsMAh0a/qo9BAgMBAAECggEBAMsuuU0G777M23v76kprsfUXJDbaq6gBC5ouP6vA+jQoqHlwoeU20Kma8E6X7EZhHTj8lhDgsag3RBqhoDPnZMNA6PF60vT/0jfhRslbwtFuQpbrnAPe+kzNTfN1h6H7IbNODb3xeXG2FGIRioPkxypU0gr88Or36YKyCGz5vEVpGjxi/3c5IkuVHouqE93yby5KviaYGA6fySv3lrDpyOEz+gOY+RvBu8u4bWx7MIxGabsYe+uTZK365Y+bOC/xoBvs8Qp/hmC6rmEex3ssGaS7W4B9qwnSZeyO3AwNB+CuHs7RVieRQSEqCYSeo7HHzWjOWApKvftVicEGxC6XJQECgYEA9XhZexC2b+kPjfZhM6yZuwqiyszMXRvGnJbyCU1TFQoQjhFWjOUrnkseeI7F2w5XnnOsYQiyWQTOJz2Rdjai5H99TSrJOvE0N2SXZyNlIxw6ivC59jWDvl26aak3QnHDnK9VHpS64b/0P+bM686PTbINj0EUNNPojQW0TAB6ym0CgYEA44J0UKwUwMqdCisidMwfIq5cAKRSdGqjnHMJjrUkOItv2xIlpBEvA0Ef/rdiraAoAckpv/VsOrAhdmGWhNrVomEo/scwZ4nRSYacFPqxWSzbdiSUvi2GHnziTd2FIn0wMoelhIGgArLTPx7JWU/+kabL7bdYcqYOfltiSnGAE6UCgYEAl+wJbWo1j2OuFc2j8Shk6Oc3Q86muQWE0ct2Nx2dSws0ncjLSV5YtZqGXFT4zY+92Lp8uH16bC/WK2EmkwRTopnpAgZ2Dr3T9GiUb+fvI2DINs+wOFp8lChMRDLPmZbxWxsE0m14kFmOILKGp3brKEoHrF6508xHRGiAYv11Aa0CgYBxQM+GGSN7lWD3XuGYIsSdDw7dgu9I5IztpJZtY97UBxV3iGEUezlb9V9n/QIyTDeeK/WMiS+HR4Zg19OF7ynJ23P84EtIP2LfpxKrnuAJ9DqLZUpmIWNSafh9qnhL4uXLQZszixOMRFjEYx74RsoC13VMsKhm6iLs47DaPgXzwQKBgEbDtCp12PsDalBkL+pz1HAW1n2bCbYPUSEeRYrUQ7ee+1aWqKG6215DZ1ig/fqVJe/QCXywuOJxRyOC4F0D8wnYRf0RklVH5kx8ChRHWbiM4vIaHjYc39QOKn2WUASmeNTl52mGiM3v1kDPNtj00n/DowBi2GZQpBwfLuIOZ8EV\n-----END PRIVATE KEY-----","-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAroLZbu8i08fxZ4HEF0dT1lUVEgguMRdp8UG2DMJPgJ2u00gW20y7aryG9AMkqUIGMhys0KJqDi9rvXeOV9LKY2iS8pP/hMmtP9s5wLfur5K0eT6WZJNehxKVUNb7USinTOOB589Z2WllqFEMYFjsS9wY6beuh6cUxikDAOynRJe8k+SavrJKo0zxcjGPR5zcRu0UC1DZBQfX6iUBdawxU9uTMQsD6lQw6PDdXJHF4ksG41AV1hx08glr1wEnOaTenKCpPIAUdWQZtsQbWR3gHr+10DABYE4h0M+a+FNAhcZiSoxR1LikQcmMURlFIsmesQTEYjdM1r3/fdeN/lstywIDAQAB\n-----END PUBLIC KEY-----");
	// let alipay = new Alipay("2016080300156758","-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC6/VqnXpbk7CsaJwR7CfIoRCtlKE6i+ZWjt+T/PIJGBlD4XqDz8PynHeNrNbjdQQhNDAHnVk5oChpqFW81PjP8OENQEeGo/YWk05xI9A+Me99DTvmQaJPDcYrU+t3q7UPK6mPhy/ahjzLdnKF1aAvZlzyG+vrul8fSGI0vbdrDj+EEtL5TWxAhmauj2q8QNyntE98ttua+5/BRbjxjv6wvNoUntyXYJI3wAcP3diEzPZatzRwekA+4Id9EzDlnC64BjD2wP/1Fl+1UhS7hhWobMbIHV9gW9/oeu+PY2zzF6CqFVXEM8KUHR9NTPrJisGxLQbkvmjqQBu53TKA0cFoDAgMBAAECggEAcQAsqZqTC9LhFVPg9E4FZmoT43ThWMIFuUOngstZWuH0SrQ9Bk5rEL8SMTbs+eCUGKOZ/uh8R4lbfyJm60Ek/1Ys75VuzsYu3nX3K2s6fkZZnP57+NYJ/gF+yci1FYS/BEBzjf/JksbMEXrXY/E1wBASRuwjes6EtiWaJMB5hNZB4CqlpXf4+h1TPWFfuKTVGm11I0ZLwikyoofE5ec5G7rFF5WOTG5rZwocVSYxJUAWzbg9NrBIpmAOWBOkvI4Ye+G2YhHMjd4/1KDhsvxFDCEfEg/L7Bl5qmKdsJv5vh0nvZ6LsQCdnoxyzjRCQ2oD39rszjbCmp26iW/qJTE9iQKBgQD96aJCowWyhlw58/BLk1dQ19p33jDhLdie8i8LOB1lc2ADtycrsy3BiGZfJ3tKYuggpYLJJE5fnG+NQ9TrfgUiGK6EUZK++EbcENLWmp8zNlr3P8o53OpvMWvx87i91bIF2H4DS41moY0dj3NAOiA91Ngj9DNsTOT/MNbnK+BC7QKBgQC8huEJO6aenNJbA5KuJRk1q0w98aCK6ZoGyaU1O1pnp4KMT0AG2jSJG1fqXCUFKb8ZXj7+U+TOlLU0e4vTMXKJmIGqHdmMhDpp5bOVce3ftQmk1w+PgLnRdhJ618AU7lF5KKx5fX1XNgGl9N/I2nwcA/9aIeD0Mi6njS8lnLfCrwKBgBbN6vLNLW/RPWs/C2/eNdNe75IgdIdk1LXBzpPVYF6CNDdhNbVpDEz7cSZOp3YQ2ARGmS5zgk54AFTRqMfVs6RSTyo3IVThe4u8PxNjI7U3xoe6RPFZc/y0lZtPZmI2VRzNStQE7xgunjvvbExya/7hpN/lyNCLP23j9wkgGa4pAoGAeXgmMn6+ol/EoWOx9IZuscfG/fpbSGWvGkR+L8goPbUORj0hsciSJOz7PkNUjvkQ6dVxnQiM2hWykzgvJUos1D7w/Jzy+LiRsn2PsfCQJZ1Ns2nl2r5D+5Op4IB2gIX09K2iQzz5r2FauoUGUzGC2cIxmu9NM8nJiadMA13wgH0CgYBj85mVqaquxX+3e43wmzp1GRkyRSZRHXu9yXhyPh+IYH8FWkX8MuY+o1pxbdzCozB/BP5wBiBQ/iQRKtidTdRQxPdWUYshh2ZxV7g1fU3Zy1GkXzU7sUSPszwUkomM44HIfHiwqoR/c+xiwCecW5WgHGsSVF/A/rzzS3CeyqloWg==\n-----END PRIVATE KEY-----","-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztsEcqAjKone1xajA9uTP2+baMg89iKIcQrdPCaxZuluvkS+A4fMPDl8ENjZc2NgE8yE8r155G3YxJlySbrD6VNcS+HNq///rCSWyXjfuhNNJUKDLqNvZwtvrweuR6lxKVd9G/GtWSzFJOqLKQMV56KYaTfTOGaoF3mHH5wy/bqm+QKiEUfef7vjHFwr0cnh8MUlly9795vkY52wYVLoJ7melDg8gprZ6yecGb2f/KIWLKyhV/N2My5iIM3snhFrXENLw6ZxbYhtmsplSWinLMrJTPC7CzFUf3p8eKmmlYpGw843OR2v7OqLe0TFXKOLsxcwOrgpuqRhny5/0bb7gQIDAQAB\n-----END PUBLIC KEY-----");
	let alipay = new Alipay("2016080300156758","-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCnYVFzwQrc6gUbfVjMjZXUppT9Dsc0l49SiFrqU6x8T+RMliZpDtTohCFGoCtUspL8F/LWeluQaTIJiwrvX3DByKzaajFeRksJ2nLf1+BPePfWsFdeQg5ZtKqDGBVdVkeQjcHltfn60zd2IiK0UCFqMYw+JcgtJO8wK8K/m/s8DBxT7VbGTjxGUKNAB6iZQim0mvkwdIghK10se26RvK8whfC8oucaVJHY1IOmSqAZmIIIy17dfMi11OZbd/63tz+1ID9VQdsY0u8p2omUNsg+EhJigP9VK4usv6jPCTqRyOoJYrDyRD/e3BVzMF7UIbXNxZsBhmy/l4ncQ391nD0xAgMBAAECggEAVmS56Rhz5fD4r+a0BejytC9DaZbOJYwxEvWEj7yepA+MlCdQLhvUsys4Db8wfmgpy+sEkcXYKyLRC/Hzs/g8OBm/doEneDSqGKzjbDx98CdNLUgZ4HIR/CVveXjd1i5pg+hXc5zJKbkJwHUAGrfdd3WZoJ5Zw0t0FhYQUFxPgf8YdLH7qrFE1pf/O8HOGoN2JGsfEi64VKRMhbZXwoTjc219Vyd4xnAKmigh2gUXF0AKOOmbhjIIBx+4RKv7tOpYwlXP5bdaUeeMVdDfAyV/P4fHe/YzWmnrJQJAwnjLqz7uj+D4DpH59KvnIYQGEJNgIwQjSs7j10S49xN5s9H97QKBgQD71OiISRn+vVfuMhZzwc2liMgViaK/nzUpnotkqESfi5qUGK47+pVC0FVdgu+BqaybeKjXru1YNGgH901+RY1FhfPS5niG6rNFbH1zuJiJldyM4mQ5TVku/cj3chxPV81fr/88K/D/cE6cDTmJManlpL1Ib+V1JhslYfUWSCfStwKBgQCqJo/GB9Vs6zgwMaW5nFxNMuAGAfgUoXCDSjp+825YGNpQJ/TxAcHMWz8OY4o2lXcGk2APO1p8LJNfDt246yTyc8eri5KqXJd5/a6KSkmcFyOw/Nd209+b94l3gDIBXMKbwb7/iTbI5jPXXbD4fOmk9aq+LXF7LJgsLIj3LBRnVwKBgAxQxDJuCMRpdBRlBK4Si0EOKGLNQVVHruzjIQQCKqD2zc9ySYsLXSNQVuxky9u2dYeA5hjuKBNJNNE26eZD9n2w6FSnCrvmXHAHtzbijysjVg7Zv3cB7lua86oOPY4vyA5m5/+EUpvbXSzKhMbN0/Y0EUGqnzkUbP1uBfNaAgCPAoGBAJaIiTh9Y7/6Fnrk4abmA+80rGgEQ/QUpBMzj68TNTNxwWua/iRfFpLyw0W6oOQLtgM2TY0MSNCFK1i1MUpRlx19e1B0qixYwJbn7gxhDuCuxB/ogcOaTUGSbacw3ozAAViFv7IaNkLlD0ZhmJkvAhK0Wfvo/nYoDPU/7WkoMWD/AoGBAOvk9BVGJ/+Jp/zzWbJB+VBW9uDus9XM3gsfkSTePWuTi+TS4xKjNkogS9oUMkuMWLtB9FK3YjyVQP1oFbiaJIuzPSzYfq7pXjmQ3kCbHHrdKCKaiUbR9z0SzFNARq3CPuRGPOykZ9sOXKXDGfyxnvGZpuDx/7FSD+Ei7wsijtTu\n-----END PRIVATE KEY-----","-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwBqPgl0z7qWAUX4G2w3XMKhErWmKxMnCTniqylwYqSMVD6oW2UnSxa50AzXXiVH5ss+XkKVnAo4bPxzpPj+NVF1TmZYTdSeQMVT4mbOpwXGadqh+9czTHFhqlc7urZswxmjOVv72AvzI4h/BYEcL2St34/x06C7xQvYpQeMYVbK9gzzVbI+o8x4tlc+CoUY0Uq0Eum9bd2eKSHUnaY24deCM5VYD5dXytUZA90axnU4cZ6DPqdFGcRdjrtTEEteTtenJh90vEYxp/6GueTr2WDhvuNnax3E1Aelip07JzXJUAYPiQ61RfVf/SHskKyZOz8yCfaFKikYSVVYKUNXSMQIDAQAB\n-----END PUBLIC KEY-----");
	// let alipay = new Alipay("-----BEGIN PRIVATE KEY-----\n\n-----END PRIVATE KEY-----","-----BEGIN PUBLIC KEY-----\n\n-----END PUBLIC KEY-----");
	alipay.getShopList();

}


module.exports = Alipay;