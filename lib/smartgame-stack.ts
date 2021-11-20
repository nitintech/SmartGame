import * as cdk from '@aws-cdk/core';
import { SmartGame } from './smart_game';

export class SmartGameStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new SmartGame(this, "SmartGame");
  }
}
