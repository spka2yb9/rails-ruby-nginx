/* CASE 33 — ECS上の本番で、どのコードが動いているか確かめる（ALB → サービス → タスク定義 → ECR）
   AWS の応答は aws-learning のシミュレーター（vendor/aws-sim.min.js）が返す。構成は tools/aws-sim/rails.ts の railsOnEcs() */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/jinzai-rails';

var files = {};

files[ME + '/.aws/config'] =
'[default]\n' +
'region = ap-northeast-1\n' +
'output = json\n';

/* AWS のドキュメントの例と同じ形の偽物。学習環境の外では使えない */
files[ME + '/.aws/credentials'] =
'[default]\n' +
'aws_access_key_id = AKIAIOSFODNN7EXAMPLE\n' +
'aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/release-notes.md'] =
'# リリースノート\n\n' +
'## 4c5d6e7（昨日 19:00 リリース）\n' +
'- 応募完了メールの文面を変更（app/views/entry_mailer/completed.text.erb）\n' +
'- 求人詳細の「応募する」ボタンの文言を変更（app/views/projects/show.html.erb）\n\n' +
'## 9f8e7d6（3日前）\n' +
'- 求人検索の並び順を修正\n\n' +
'## a1b2c3d（9日前）\n' +
'- 本番を EC2（Capistrano）から ECS on Fargate へ移行\n' +
'- web（Puma）と worker（Sidekiq）を別々の ECS サービスに分けた\n';

files[SRC + '/bin/deploy'] =
'#!/usr/bin/env bash\n' +
'# 本番へのデプロイ（CI の最後に実行される）\n' +
'set -euo pipefail\n\n' +
'TAG=$(git rev-parse --short HEAD)\n' +
'REPO=123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/jinzai/rails\n\n' +
'docker build -t "$REPO:$TAG" .\n' +
'docker push "$REPO:$TAG"\n\n' +
'# web のタスク定義に新しいイメージを入れて登録し、サービスを更新する\n' +
'sed "s/__TAG__/$TAG/" ecs/web.json > /tmp/web.json\n' +
'aws ecs register-task-definition --cli-input-json file:///tmp/web.json\n' +
'aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web\n' +
'aws ecs wait services-stable --cluster jinzai-prod --services jinzai-prod-web\n';

files[SRC + '/ecs/web.json'] =
'{\n' +
'  "family": "jinzai-prod-web",\n' +
'  "cpu": "1024", "memory": "2048",\n' +
'  "containerDefinitions": [\n' +
'    { "name": "web", "image": "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/jinzai/rails:__TAG__",\n' +
'      "command": ["./bin/rails", "server"], "portMappings": [{ "containerPort": 3000 }] }\n' +
'  ]\n' +
'}\n';

files[SRC + '/ecs/worker.json'] =
'{\n' +
'  "family": "jinzai-prod-worker",\n' +
'  "cpu": "512", "memory": "1024",\n' +
'  "containerDefinitions": [\n' +
'    { "name": "worker", "image": "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/jinzai/rails:__TAG__",\n' +
'      "command": ["bundle", "exec", "sidekiq"] }\n' +
'  ]\n' +
'}\n';

files[SRC + '/app/controllers/entries_controller.rb'] =
'class EntriesController < ApplicationController\n' +
'  def create\n' +
'    @entry = current_user.entries.create!(entry_params)\n' +
'    # 応募完了メールは Sidekiq（worker）が送る\n' +
'    EntryMailer.with(entry: @entry).completed.deliver_later\n' +
'    redirect_to project_path(@entry.project), notice: "応募しました"\n' +
'  end\n' +
'end\n';

var TG = "TG=$(aws elbv2 describe-target-groups --names jinzai-prod-web-tg --query 'TargetGroups[0].TargetGroupArn' --output text)";

window.LFR.scenarios.add({
  id: 'case33',
  level: 12,
  title: 'ECS上の本番で、どのコードが動いているか確かめる',
  subtitle: 'ALB → サービス → タスク定義 → ECR のイメージを、AWS CLI でたどる',

  description:
'本番は9日前に EC2（Capistrano）から ECS on Fargate へ移りました。\n' +
'サーバーにログインしてファイルを見る、という確かめ方はもうできません。\n\n' +
'昨日の19時に、応募完了メールの文面を変えたリリース（コミット 4c5d6e7）を出しました。\n' +
'ところがサポートから、次の問い合わせが来ています。\n\n' +
'「求人ページの『応募する』ボタンは新しい文言になっているのに、応募したあとに届くメールは古い文面のままです」\n\n' +
'手元のMacの AWS CLI で、本番で何がどのイメージで動いているかを確かめてください。\n' +
'リリースノートは ~/release-notes.md、アプリのソースは ~/src/jinzai-rails にあります。',

  learn: [
    { name: 'aws ecs list-services', cmd: 'aws ecs list-services --cluster jinzai-prod',
      desc: 'クラスターの中のサービスの一覧です。\n' +
            'サービスは「このタスク定義のコンテナを、いつも N 個動かしておく」という指示です。\n' +
            'EC2 のときの systemd の unit（puma / sidekiq）に当たります。' },
    { name: 'aws ecs describe-services', cmd: "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web jinzai-prod-worker --query 'services[].{name:serviceName,taskDefinition:taskDefinition,running:runningCount}' --output table",
      desc: 'サービスが使っているタスク定義（ファミリー名:リビジョン）と、動いているタスクの数を出します。\n' +
            '--query で必要な項目だけを選び、--output table で表にしています。\n' +
            '何も付けないと JSON が数百行出るので、まず --query で絞る癖をつけてください。' },
    { name: 'aws ecs describe-task-definition', cmd: "aws ecs describe-task-definition --task-definition jinzai-prod-web --query 'taskDefinition.containerDefinitions[0].image' --output text",
      desc: 'タスク定義はコンテナのイメージ・コマンド・環境変数・ログの出し先をまとめた設計図です。\n' +
            'このプロジェクトではイメージのタグ（: の後ろ）に git のコミットの短い SHA を使っているので、\n' +
            'タグを見れば、どのコミットのコードが動いているかが分かります。' },
    { name: 'aws ecr describe-images', cmd: "aws ecr describe-images --repository-name jinzai/rails --query 'sort_by(imageDetails,&imagePushedAt)[].{tag:imageTags[0],pushed:imagePushedAt}' --output table",
      desc: 'ECR（イメージを置いておく場所）にあるイメージと、push した日時です。\n' +
            '「最新のイメージ」と「動いているイメージ」は同じとは限りません。' },
    { name: 'ターゲットグループの ARN を変数に入れる', cmd: TG,
      desc: 'ALB の後ろにいるタスクは、ターゲットグループに登録されています。\n' +
            '次のコマンドで使う ARN を --output text で取り出し、シェルの変数 TG に入れます。' },
    { name: 'aws elbv2 describe-target-health', cmd: "aws elbv2 describe-target-health --target-group-arn $TG --query 'TargetHealthDescriptions[].{ip:Target.Id,state:TargetHealth.State}' --output table",
      desc: 'ALB がリクエストを送る先（ターゲット）と、ヘルスチェックの結果です。\n' +
            'Fargate のタスクは IP アドレスで登録されます。healthy のターゲットにだけリクエストが届きます。' },
    { name: 'デプロイの手順を読む', cmd: 'cat ~/src/jinzai-rails/bin/deploy',
      desc: 'リリースのたびに何が実行されているかは、デプロイのスクリプトに書いてあります。\n' +
            '「どのサービスを更新しているか」を確かめてください。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  /* aws の応答はシミュレーターが返す。worker だけが ECS へ移したとき（a1b2c3d）のイメージのまま */
  awsEnv: function (sim) { return sim.railsOnEcs({ workerTag: 'a1b2c3d' }); },

  hints: [
    'メールを送っているのは誰かを考えてください。\n' +
    '応募完了メールは deliver_later なので、web ではなく Sidekiq（worker）が送ります。\n\n' +
    'まず本番でどんなサービスが動いているかを一覧してください。\n\n' +
    '  aws ecs list-services --cluster jinzai-prod',

    'サービスごとに、使っているタスク定義を確かめます。\n\n' +
    "  aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web jinzai-prod-worker --query 'services[].{name:serviceName,taskDefinition:taskDefinition}' --output table\n\n" +
    'web と worker で、タスク定義のリビジョン（: の後ろの数字）が違います。\n' +
    'それぞれのイメージのタグを describe-task-definition で見てください。',

    'web は 4c5d6e7、worker は a1b2c3d のイメージで動いています。\n' +
    'なぜ worker だけが古いのかは、デプロイのスクリプトを読むと分かります。\n\n' +
    '  cat ~/src/jinzai-rails/bin/deploy'
  ],

  probes: [
    { key: 'listedServices', label: 'クラスターのサービスを一覧した',
      test: function (c, res) { return /aws\s+ecs\s+(list-services|describe-services)/.test(c) && /jinzai-prod-worker/.test(res.stdout); } },
    { key: 'sawWebImage', label: 'web のイメージのタグを確かめた',
      test: function (c, res) { return /describe-task-definition/.test(c) && /jinzai-prod-web/.test(c) && /rails:4c5d6e7/.test(res.stdout); } },
    { key: 'sawWorkerImage', label: 'worker のイメージのタグを確かめた',
      test: function (c, res) { return /describe-task-definition/.test(c) && /worker/.test(c) && /rails:a1b2c3d/.test(res.stdout); } },
    { key: 'checkedEcr', label: 'ECR のイメージと push した日時を確かめた',
      test: function (c, res) { return /aws\s+ecr\s+(describe-images|list-images)/.test(c) && /4c5d6e7/.test(res.stdout); } },
    { key: 'checkedTargets', label: 'ALB のターゲットが healthy か確かめた',
      test: function (c, res) { return /describe-target-health/.test(c) && /healthy/.test(res.stdout); } },
    { key: 'readDeploy', label: 'デプロイのスクリプトを読んだ',
      test: function (c, res) { return /bin\/deploy/.test(c) && /update-service/.test(res.stdout); } },
    { key: 'usedQuery', label: '--query で必要な項目だけを取り出した',
      test: function (c) { return /^\s*(\w+=\$\()?aws\b.*--query/.test(c); } }
  ],

  evidence: [
    { key: 'listedServices', weight: 10, label: 'web と worker の2つのサービスがあると確かめた' },
    { key: 'sawWebImage',    weight: 12, label: 'web が新しいイメージで動いていると確かめた' },
    { key: 'sawWorkerImage', weight: 18, label: 'worker が古いイメージのままだと突き止めた' },
    { key: 'checkedEcr',     weight: 8,  label: 'ECR に新しいイメージがあると確かめた' },
    { key: 'checkedTargets', weight: 6,  label: 'ALB の後ろのタスクが正常だと確かめた' },
    { key: 'readDeploy',     weight: 14, label: 'worker が更新されない理由をスクリプトで確かめた' },
    { key: 'usedQuery',      weight: 4,  label: '--query で出力を絞った' }
  ],

  question: {
    text: 'リリースしたのに、応募完了メールだけが古い文面で届く原因は？',
    choices: [
      'ALB が古いイメージで動いている web のタスクにもリクエストを振り分けている',
      'worker サービスのタスク定義が a1b2c3d のイメージのままで、メールを送る Sidekiq が古いコードで動いている',
      'ECR の 4c5d6e7 のイメージが壊れていて、ECS が1つ前のイメージを使っている',
      'メールの文面は DB に入っていて、マイグレーションが流れていない'
    ],
    answer: 1,
    explain:
'ECS では「どこで何が動いているか」を、サーバーに入って見るのではなく AWS の API に聞きます。\n' +
'たどる順番は、リクエストやジョブが流れる順と同じです。\n\n' +
'  $ aws ecs list-services --cluster jinzai-prod\n' +
'  .../service/jinzai-prod/jinzai-prod-web\n' +
'  .../service/jinzai-prod/jinzai-prod-worker\n\n' +
'web（Puma）と worker（Sidekiq）は別々のサービスです。\n' +
'それぞれが使っているタスク定義を見ると、リビジョンが違います。\n\n' +
"  $ aws ecs describe-services ... --query 'services[].{name:serviceName,taskDefinition:taskDefinition}'\n" +
'  jinzai-prod-web      task-definition/jinzai-prod-web:3\n' +
'  jinzai-prod-worker   task-definition/jinzai-prod-worker:1\n\n' +
'タスク定義の中のイメージを見ると、タグ（コミット）がずれています。\n\n' +
'  $ aws ecs describe-task-definition --task-definition jinzai-prod-web ...\n' +
'  .../jinzai/rails:4c5d6e7\n' +
'  $ aws ecs describe-task-definition --task-definition jinzai-prod-worker ...\n' +
'  .../jinzai/rails:a1b2c3d\n\n' +
'画面を返す web は昨日のリリース（4c5d6e7）で動いているので、ボタンの文言は新しくなっています。\n' +
'一方、メールを送る worker は9日前の a1b2c3d のままです。\n' +
'deliver_later のメールは worker の中の古いテンプレートで作られるので、文面が古いまま届きます。\n\n' +
'理由はデプロイのスクリプトにあります。\n\n' +
'  $ cat ~/src/jinzai-rails/bin/deploy\n' +
'  aws ecs register-task-definition --cli-input-json file:///tmp/web.json\n' +
'  aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web ...\n\n' +
'更新しているのは web だけです。9日前に web と worker を別のサービスに分けてから、\n' +
'worker は一度も更新されていません（worker のタスク定義はリビジョン1のままです）。\n' +
'3日前のリリース（9f8e7d6）は検索の並び順の修正で、web だけの変更だったため、誰も気づきませんでした。\n\n' +
'直すには、worker のタスク定義に 4c5d6e7 のイメージを入れた新しいリビジョンを登録し、\n' +
'worker サービスをそのリビジョンで更新します（LEVEL 13 で扱います）。\n' +
'あわせて、デプロイのスクリプトが web と worker の両方を更新するように直します。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. ECS で「何が動いているか」は、サービス → タスク定義 → イメージのタグの順に API で確かめる\n' +
'2. 同じイメージでも、サービスごとに別のタスク定義を持つ。1つ更新しても、もう1つは変わらない\n' +
'3. イメージのタグにコミットの SHA を使えば、どのコミットのコードが動いているかがタグから分かる\n' +
'4. --query と --output（table / text）で、必要な値だけを取り出す',
    wrong: [
'web のサービスは2つのタスクを動かしていて、どちらも jinzai-prod-web:3（4c5d6e7）です。\n' +
'describe-target-health を見ると、ターゲットはどちらも healthy です。\n\n' +
'古いイメージの web のタスクが混ざっていれば「ボタンの文言が新しかったり古かったりする」はずですが、\n' +
'問い合わせはボタンの文言は新しいと言っています。\n' +
'そもそもメールは web ではなく worker が送っています。',
null,
'ECR には 4c5d6e7 のイメージが昨日 push されていて、web はそのイメージで動いています。\n' +
'イメージが壊れていれば、web も起動できないはずです。\n\n' +
'ECS は「最新のイメージ」を自動で選ぶわけではありません。\n' +
'タスク定義に書いたイメージを、書いたとおりに使います。',
'リリースノートにあるとおり、文面を変えたのは app/views/entry_mailer/completed.text.erb で、\n' +
'イメージの中に入っているファイルです。DB には入っていません。\n\n' +
'同じイメージで動いている web では新しい文言が出ているので、\n' +
'「どのイメージで動いているか」が web と worker で違う、と考えるのが筋です。'
    ]
  },

  route: {
    steps: [
      'リリースノートで、何をいつ変えたかを確かめる',
      'クラスターのサービスを一覧する（web と worker がある）',
      'サービスごとに、使っているタスク定義を確かめる',
      'タスク定義のイメージのタグを比べる（web: 4c5d6e7 / worker: a1b2c3d）',
      'ECR で、新しいイメージが push されていることを確かめる',
      'ALB の後ろの web のタスクが healthy か確かめる',
      'デプロイのスクリプトで、worker が更新されない理由を確かめる'
    ],
    commands: [
      'cat ~/release-notes.md',
      'aws ecs list-services --cluster jinzai-prod',
      "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web jinzai-prod-worker --query 'services[].{name:serviceName,taskDefinition:taskDefinition,running:runningCount}' --output table",
      "aws ecs describe-task-definition --task-definition jinzai-prod-web --query 'taskDefinition.containerDefinitions[0].image' --output text",
      "aws ecs describe-task-definition --task-definition jinzai-prod-worker --query 'taskDefinition.containerDefinitions[0].image' --output text",
      "aws ecr describe-images --repository-name jinzai/rails --query 'sort_by(imageDetails,&imagePushedAt)[].{tag:imageTags[0],pushed:imagePushedAt}' --output table",
      TG,
      "aws elbv2 describe-target-health --target-group-arn $TG --query 'TargetHealthDescriptions[].{ip:Target.Id,state:TargetHealth.State}' --output table",
      'cat ~/src/jinzai-rails/bin/deploy'
    ],
    note:
'ALB から順にたどっても、ECR から逆にたどっても構いません。\n' +
'覚えてほしいのは、ECS では「何が動いているか」を API に聞くことと、\n' +
'サービス → タスク定義 → イメージのタグ、の対応です。\n' +
'（学習環境の ALB は HTTP:80 のリスナーだけを再現しています。本番では HTTPS:443 で TLS を終端します）'
  }
});
})();
