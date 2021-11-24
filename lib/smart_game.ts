import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class SmartGame extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const gameDataTable = new dynamodb.Table(this, 'gameData', {
      partitionKey: {name:'gameSessionId', type: dynamodb.AttributeType.STRING},
    });

    const gameIdentifiersTable = new dynamodb.Table(this, 'gameIdentifiers', {
      partitionKey: {name:'gameId', type: dynamodb.AttributeType.STRING},
    });

    const handler = new lambda.Function(this, "loginHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "GameSetupHandlerService.main",
      environment: {
        gamesData: gameDataTable.tableName,
        gamesIdentifiers: gameIdentifiersTable.tableName,
      }
    });

    gameDataTable.grantFullAccess(handler);
    gameIdentifiersTable.grantFullAccess(handler);

    const api = new apigateway.RestApi(this, "smartgame", {
      restApiName: "smartGameSetup",
      description: "This service serves creates and manages games."
    });

    const getGamesIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });


    // Simple root get will provide a list of available games to play from
    api.root.addMethod("GET", getGamesIntegration); // GET 

    /*
    Need to support the following use cases:

    /prod/getAllGames Response: [{"gameName":"Nim", "gameId:1"}]
    /prod/EnrollNewGame?gameName=Nim,playersNeeded=2 Response: {"gameName":"Nim", "gameId":"1"}
    /prod/StartNewSession?gameId:1 Response: {"gameId":"1", "gameSessionId": "1234", "gameName": "Nim"}
    /prod/AddNewPlayer?gameSessionId:1234,playerName=nitin

     // Add more details as you go forward. This should be a good starting point

    */
    const functionName = api.root.addResource("{id}");
    functionName.addMethod("GET", new apigateway.LambdaIntegration(handler));
    functionName.addMethod("POST", new apigateway.LambdaIntegration(handler));

  }
}