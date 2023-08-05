import * as assert from 'assert';
import { declarations, reDeclaration } from '../ebo-declaration';

describe('declarations', () => {
    describe('regex tests', () => {
        it('all declarations should match', () => {
            declarations.forEach(d => {
                if (!reDeclaration.test(d)) {
                    assert.fail(d);
                }
            });
        });
        it('all bad declarations should not match', () => {

            const badDeclarations = [
                "Trendlog Output",
                "Trendlog Input",
                "Datafile Output",
                "Datafile Input",
                "Webservice Output",
                "Webservice Input",
                "Webservice Output",
                "Webservice Input",
                "Numeric Buffered Output",
                "Numeric Triggered Output",
                "Numeric Buffered Public",
                "Numeric Triggered Public",
                "DateTime Buffered Input",
                "DateTime Triggered Input",
                "DateTime Buffered Output",
                "DateTime Triggered Output",
                "DateTime Buffered Public",
                "DateTime Triggered Public",
                "String Buffered Input",
                "String Triggered Input",
                "String Buffered Output",
                "String Triggered Output",
                "String Buffered Public",
                "String Triggered Public",
            ];
            
            badDeclarations.forEach(d => {
                if (reDeclaration.test(d)) {
                    assert.fail(d);
                }
            });
        });
    });
});

