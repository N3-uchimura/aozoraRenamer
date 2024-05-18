/**
 * rename.ts
 **
 * function：txtリネーム
**/

// モジュール
import path from 'path'; // path
import iconv from 'iconv-lite'; // Text converter
import log4js from 'log4js'; // logger
import Encoding from 'encoding-japanese';
import { promises } from 'fs'; // fs
import { setTimeout } from 'node:timers/promises'; // wait for seconds

// Logger config
const prefix: string = `logs/${(new Date().toJSON().slice(0, 10))}.log`

// ロガー設定
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        system: { type: 'file', filename: prefix }
    },
    categories: {
        default: { appenders: ['out', 'system'], level: 'debug' }
    }
});
const logger: any = log4js.getLogger();

// ファイルシステム
const { readFile, readdir, rename } = promises;

// main
(async () => {
    try {
        // ファイル一覧
        const files: string[] = await readdir('txt/');

        // 全ループ
        await Promise.all(files.map((fl: string, idx: number): Promise<void> => {
            return new Promise(async (resolve, reject) => {
                try {
                    // ファイル名
                    let newFileName: string = '';
                    // ファイルパス
                    const filePath: string = path.join(__dirname, 'txt', fl);
                    // リネーム後パス
                    const renamePath: string = path.join(__dirname, 'renamed');
                    // ファイル読み込み
                    const txtdata: Buffer = await readFile(filePath);
                    // 文字コード検出
                    const detectedEncoding: string | boolean = Encoding.detect(txtdata);
                    logger.info('charcode: ' + detectedEncoding);
                    // 文字列以外エラー
                    if (typeof (detectedEncoding) !== 'string') {
                        throw new Error('error-encoding');
                    }
                    // デコード
                    const str: string = iconv.decode(txtdata, detectedEncoding);
                    logger.debug('char decoding finished.');
                    // wait for time
                    await setTimeout(1000);
                    // 改行コードで分割
                    const strArray: string[] = str.split(/\r\n/);
                    // タイトル
                    const titleStr: string = strArray[0];
                    // サブタイトル
                    const subTitleStr: string = strArray[1];
                    // 著者
                    const authorStr: string = strArray[2];
                    // 編者
                    const editorStr: string = strArray[3];
                    // インデックス
                    const paddedIndex: string = (idx + 16343).toString().padStart(5, '0');

                    if (editorStr.trim() == '') {

                        if (authorStr.trim() == '') {
                            // ファイル名
                            newFileName = path.join(renamePath, `${paddedIndex}_${titleStr}_${subTitleStr}.txt`);

                        } else {
                            // ファイル名
                            newFileName = path.join(renamePath, `${paddedIndex}_${titleStr}_${subTitleStr}_${authorStr}.txt`);
                        }

                    } else {
                        // ファイル名
                        newFileName = path.join(renamePath, `${paddedIndex}_${titleStr}_${subTitleStr}_${authorStr}_${editorStr}.txt`);
                    }

                    // リネーム
                    await rename(filePath, newFileName);
                    // wait for time
                    await setTimeout(1000);

                    // 完了
                    resolve();

                } catch (e: unknown) {
                    if (e instanceof Error) {
                        //logger.error(e.message);
                        reject();
                    }
                }
            });
        }));
        // 完了
        logger.info('operation finished.');

    } catch (e: unknown) {
        if (e instanceof Error) {
            // エラー
            //logger.error(e.message);
        }
    }
})();