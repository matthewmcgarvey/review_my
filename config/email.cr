BaseEmail.configure do |settings|
  if LuckyEnv.production? || LuckyEnv.development?
    ses_region = carbon_key_from_env("SES_REGION")
    ses_access_key = carbon_key_from_env("SES_ACCESS_KEY")
    ses_secret_key = carbon_key_from_env("SES_SECRET_KEY")

    settings.adapter = Carbon::AwsSesAdapter.new(
      key: ses_access_key,
      secret: ses_secret_key,
      region: ses_region
    )
  else
    settings.adapter = Carbon::DevAdapter.new
  end
end

private def carbon_key_from_env(key)
  ENV[key]? || raise_missing_key_message(key)
end

private def raise_missing_key_message(key)
  puts "Missing #{key}. Set the #{key} env variable to 'unused' if not sending emails, or set the #{key} ENV var.".colorize.red
  exit(1)
end
