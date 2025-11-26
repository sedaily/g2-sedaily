#!/bin/bash

set -e

echo "🚀 Setting up API Gateway for Quiz API..."

REGION="us-east-1"
LAMBDA_NAME="sedaily-quiz-api"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"

# 1. Create REST API
echo "📝 Creating REST API..."
API_ID=$(aws apigateway create-rest-api \
  --name sedaily-quiz-api \
  --description "Quiz API for dynamic quiz management" \
  --region $REGION \
  --query 'id' \
  --output text)

echo "✅ API Created: $API_ID"

# 2. Get root resource
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region $REGION \
  --query 'items[0].id' \
  --output text)

echo "Root Resource ID: $ROOT_ID"

# 3. Create /quiz resource
echo "📝 Creating /quiz resource..."
QUIZ_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part quiz \
  --region $REGION \
  --query 'id' \
  --output text)

# 4. Create /{proxy+} resource for catch-all
echo "📝 Creating /{proxy+} resource..."
PROXY_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $QUIZ_ID \
  --path-part '{proxy+}' \
  --region $REGION \
  --query 'id' \
  --output text)

# 5. Lambda ARN
LAMBDA_ARN="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$LAMBDA_NAME"
LAMBDA_URI="arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# 6. Create ANY method on /{proxy+}
echo "📝 Creating ANY method..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_ID \
  --http-method ANY \
  --authorization-type NONE \
  --region $REGION

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PROXY_ID \
  --http-method ANY \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri $LAMBDA_URI \
  --region $REGION

# 7. Create OPTIONS for CORS
echo "📝 Setting up CORS..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_ID \
  --http-method OPTIONS \
  --authorization-type NONE \
  --region $REGION

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PROXY_ID \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
  --region $REGION

aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $PROXY_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Allow-Origin":false}' \
  --region $REGION

aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $PROXY_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,Authorization'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,POST,PUT,DELETE,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
  --region $REGION

# 8. Grant Lambda permission
echo "📝 Granting Lambda permission..."
aws lambda add-permission \
  --function-name $LAMBDA_NAME \
  --statement-id apigateway-invoke-$(date +%s) \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" \
  --region $REGION 2>/dev/null || echo "Permission already exists"

# 9. Deploy API
echo "📝 Deploying API to prod stage..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --region $REGION

# 10. Output
API_URL="https://$API_ID.execute-api.$REGION.amazonaws.com/prod"

echo ""
echo "✅ API Gateway Setup Complete!"
echo ""
echo "API ID: $API_ID"
echo "API URL: $API_URL"
echo ""
echo "📝 Update your .env.local:"
echo "NEXT_PUBLIC_QUIZ_API_URL=$API_URL"
echo "NEXT_PUBLIC_QUIZ_SAVE_URL=$API_URL/quiz"
echo ""
echo "🧪 Test the API:"
echo "curl $API_URL/quiz/BlackSwan/dates"
