import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Smartgame from '../lib/smartgame-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Smartgame.SmartgameStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
