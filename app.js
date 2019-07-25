import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';
import request from 'request';
import path from 'path';
import a from 'async';

class manhuadb
{
    constructor(index){
        this.baseurl = "https://www.manhuadb.com";
        this.url = this.baseurl+'/manhua/'+index;
    }
    async fetch_data()
    {
        const html = await fetch(this.url)
        .then(res=>res.text())

        let $ = cheerio.load(html);
        const mangatitle = $('h1.comic-title').text();
        //const description = $('p.comic_story').text();
        let mangalist=[];
        $('.active .links-of-books.num_div').find('li.sort_div').each((idx, ele) => {
            mangalist.push({
                Chaptertitle: $(ele).find('a').attr('title'),
                href:`${this.baseurl}${$(ele).find('a').attr('href')}`
            });
        });
        //console.log(mangalist);
        this.mangatitle = mangatitle;
        return {
            mangatitle,
            mangalist};
    }
    async getChapter(url)
    {
        const html =  await fetch(url)
        .then(res=>res.text());
             //获取每张画的url
        let list=[];
        let $ = cheerio.load(html);
        $('select.form-control').eq(0).find('option').each((idx,ele)=>{
        let imgurl = `${this.baseurl}${$(ele).attr('value')}`;
        list.push(imgurl);
        });
        return list;
    }
    async getMangaData() //获取url
    {
        try{
        const data = await this.fetch_data();
        const mangalist = data.mangalist;
        const mangatitle = data.mangatitle;
        var manga=[];
        for (let i in mangalist)
        {
            manga.push({
                Chaptertitle:mangalist[i].Chaptertitle,
                Chapter:await this.getChapter(mangalist[i].href)
            });
        }
        }
        catch(e){
            console.log(e);
        }
        this.manga = manga;
        return this;
    }
}

async function getSrcData(url)
{
    const html = await fetch(url).then(res=>res.text());
    let $ = cheerio.load(html);
    let src = $('img.img-fluid').attr('src');
    if (src===undefined)
    {
        throw new Error("get src err");
    }
    return `https://www.manhuadb.com${src}`;
}

async function downlad_onePage(local,url,fail_time)
{
    getSrcData(url).then(src=>{
    console.log(src);
    const name = path.basename(src);
    request(src).pipe(fs.createWriteStream(path.join(local,name)))
    }).catch((err)=>{
        if(fail_time>1)
        {
            console.log("!!!!!!!!!RETRY!!!!!!!!"+fail_time);
            downlad_onePage(local,url,fail_time-1);
        }
        else{
            console.log("!!!!!!!!download some page err :"+err+" url: "+url+"!!!!!!!!!!!!!!");
        }
    })
}

async function download_Chapter(data)
                                //输入manhuadb.manga[i]
{
    const Chapter = data.Chapter;
    //data=
    //{loacl:"str",
    //Chapter:{Chaptertitle: '[东京喰种re][石田翠][电子版]Vol_01',
    //         Chapter:[...]
    //        }
    //}

    const local = data.local;    

    const Chaptertitle = Chapter.Chaptertitle;
    const Chapter_Content = Chapter.Chapter;
    const local_manga_onebook = mkdir_(local,Chaptertitle);

    Promise.all(Chapter_Content).then( (pagelist)=>{
        for(let i in pagelist)
        {
            downlad_onePage(local_manga_onebook,pagelist[i],10);
        }
    })

}

function mkdir_(local,dir)//local 最开始为‘./’
{
    if(fs.existsSync(dir))
    {}
    else{
        fs.mkdirSync(path.resolve(local,dir))
    }
    return path.resolve(local,dir);
}

async function download(mangaclass)
{
    const manga = mangaclass.manga;
    const mangatitle = mangaclass.mangatitle;
    const local_manga = mkdir_('./',mangatitle);
    
    let manga_download_data = [];
    for (let i in manga)
    {
        manga_download_data.push({
            local:local_manga,
            Chapter:manga[i]
        });
    }
    await download_Chapter(manga_download_data[0]); //只下一章 index为章节，推荐这里用await阻塞加for循环
}

const manhua = new manhuadb(1268);

manhua.getMangaData()
.then(mangaclass=>download(mangaclass))
.then(()=>{console.log("get done")});