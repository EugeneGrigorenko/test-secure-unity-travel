# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.7.1'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 6.0.2', '>= 6.0.2.2'
# Use sqlite3 as the database for Active Record
gem 'sqlite3', '~> 1.4'
# Use Puma as the app server
gem 'puma', '~> 4.3'
# Use SCSS for stylesheets
gem 'sass-rails', '>= 6'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.7'

gem 'jquery-rails'
gem 'jquery-ui-rails'

gem 'font-awesome-sass', '4.0.1'
gem 'sassc-rails'

gem 'bootstrap-multiselect-rails'
gem 'bootstrap-sass'

gem 'bootstrap-will_paginate'
gem 'flex-slider-rails'

gem 'jquery-tablesorter'
gem 'remotipart', '1.4.3' # Rails jQuery file uploads via standard Rails "remote: true" forms. (http://os.alfajango.com/remotipart)
# necessary for best_in_place
# gem 'best_in_place', '2.1.0', git: 'https://github.com/aaronchi/best_in_place.git'
gem 'coffee-rails'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.4.2', require: false

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: %i[mri mingw x64_mingw]
  gem 'rails-controller-testing'
  gem 'rspec-rails'
  gem 'rubocop'
  gem 'rubocop-performance', require: false
end

group :development do
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'web-console', '>= 3.3.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'simplecov', '= 0.18.5', require: false, group: :test
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]
