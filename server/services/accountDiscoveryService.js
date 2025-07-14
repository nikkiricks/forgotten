import puppeteer from 'puppeteer';

class AccountDiscoveryService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.platforms = [
      'linkedin',
      'instagram', 
      'facebook',
      'youtube',
      'twitter'
    ];
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      product: 'firefox',
      protocol: 'webDriverBidi',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito']
    });
    
    const context = await this.browser.createBrowserContext();
    this.page = await context.newPage();
    
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
  }

  async discoverAccounts(searchData) {
    try {
      const { fullName, email, username, dateOfBirth, location } = searchData;
      
      console.log(`Starting account discovery for: ${fullName}`);
      
      // Demo mode - return sample results quickly for testing
      if (fullName.toLowerCase().includes('demo') || fullName.toLowerCase().includes('test')) {
        return this.getDemoResults(searchData);
      }
      
      await this.initialize();
      
      const discoveryResults = {
        searchCriteria: {
          fullName,
          email: email ? this.maskEmail(email) : null,
          username,
          location
        },
        platforms: {},
        summary: {
          totalFound: 0,
          totalSearched: this.platforms.length,
          confidence: 'medium'
        },
        timestamp: new Date().toISOString()
      };

      // Search each platform
      for (const platform of this.platforms) {
        console.log(`Searching ${platform}...`);
        try {
          const result = await this.searchPlatform(platform, searchData);
          discoveryResults.platforms[platform] = result;
          if (result.found) {
            discoveryResults.summary.totalFound++;
          }
        } catch (error) {
          console.error(`Error searching ${platform}:`, error.message);
          discoveryResults.platforms[platform] = {
            found: false,
            error: error.message,
            confidence: 'unknown'
          };
        }
        
        // Add delay between searches to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Calculate overall confidence
      discoveryResults.summary.confidence = this.calculateConfidence(discoveryResults);

      return discoveryResults;

    } catch (error) {
      console.error('Account discovery error:', error);
      throw new Error('Failed to complete account discovery');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async searchPlatform(platform, searchData) {
    const { fullName, email, username } = searchData;
    
    switch (platform) {
      case 'linkedin':
        return await this.searchLinkedIn(fullName, email);
      case 'instagram':
        return await this.searchInstagram(fullName, username);
      case 'facebook':
        return await this.searchFacebook(fullName);
      case 'youtube':
        return await this.searchYouTube(fullName, username);
      case 'twitter':
        return await this.searchTwitter(fullName, username);
      default:
        return { found: false, error: 'Platform not supported' };
    }
  }

  async searchLinkedIn(fullName, email) {
    try {
      // Search LinkedIn using public search
      await this.page.goto('https://www.linkedin.com/pub/dir/', {
        waitUntil: 'networkidle2',
        timeout: 8000
      });

      // Use LinkedIn's public directory search
      const searchUrl = `https://www.linkedin.com/pub/dir/${this.formatNameForLinkedIn(fullName)}`;
      
      await this.page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      // Look for profile results
      const profiles = await this.page.$$('.result-card, .profile-card, .people-card');
      
      if (profiles.length > 0) {
        const profileData = await this.extractLinkedInProfiles(profiles, fullName);
        return {
          found: true,
          profiles: profileData,
          confidence: this.calculateProfileConfidence(profileData, fullName),
          searchMethod: 'public_directory'
        };
      }

      return { found: false, confidence: 'low', searchMethod: 'public_directory' };

    } catch (error) {
      console.error('LinkedIn search error:', error.message);
      return { found: false, error: error.message, confidence: 'unknown' };
    }
  }

  async searchInstagram(fullName, username) {
    try {
      // Try direct username search first
      if (username) {
        const usernameVariations = this.generateUsernameVariations(fullName, username);
        
        for (const variation of usernameVariations) {
          const profileUrl = `https://www.instagram.com/${variation}/`;
          
          try {
            await this.page.goto(profileUrl, {
              waitUntil: 'networkidle2',
              timeout: 8000
            });

            // Check if profile exists (not 404)
            const isNotFound = await this.page.$('h2:contains("Sorry, this page isn\'t available")') ||
                              await this.page.$('.error-container') ||
                              await this.page.title().then(title => title.includes('Page Not Found'));

            if (!isNotFound) {
              // Try to extract profile information
              const profileInfo = await this.extractInstagramProfile(variation);
              
              if (profileInfo) {
                return {
                  found: true,
                  profiles: [profileInfo],
                  confidence: this.calculateNameMatch(profileInfo.displayName || variation, fullName),
                  searchMethod: 'username_variation'
                };
              }
            }
          } catch (navigateError) {
            console.log(`Instagram username ${variation} not found:`, navigateError.message);
            continue;
          }
        }
      }

      return { found: false, confidence: 'low', searchMethod: 'username_variation' };

    } catch (error) {
      console.error('Instagram search error:', error.message);
      return { found: false, error: error.message, confidence: 'unknown' };
    }
  }

  async searchFacebook(fullName) {
    try {
      // Use Facebook's public search
      const searchQuery = encodeURIComponent(fullName);
      const searchUrl = `https://www.facebook.com/public/${searchQuery}`;
      
      await this.page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      // Look for profile results in public search
      const profiles = await this.page.$$('.result, .profile-link, [data-testid="search-result"]');
      
      if (profiles.length > 0) {
        const profileData = await this.extractFacebookProfiles(profiles, fullName);
        return {
          found: true,
          profiles: profileData,
          confidence: this.calculateProfileConfidence(profileData, fullName),
          searchMethod: 'public_search'
        };
      }

      return { found: false, confidence: 'low', searchMethod: 'public_search' };

    } catch (error) {
      console.error('Facebook search error:', error.message);
      return { found: false, error: error.message, confidence: 'unknown' };
    }
  }

  async searchYouTube(fullName, username) {
    try {
      // Search YouTube using the search functionality
      const searchQuery = encodeURIComponent(fullName);
      const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}&sp=EgIQAg%253D%253D`; // Channel filter
      
      await this.page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      // Look for channel results
      const channels = await this.page.$$('ytd-channel-renderer, .channel-renderer');
      
      if (channels.length > 0) {
        const channelData = await this.extractYouTubeChannels(channels, fullName);
        return {
          found: true,
          profiles: channelData,
          confidence: this.calculateProfileConfidence(channelData, fullName),
          searchMethod: 'search_results'
        };
      }

      return { found: false, confidence: 'low', searchMethod: 'search_results' };

    } catch (error) {
      console.error('YouTube search error:', error.message);
      return { found: false, error: error.message, confidence: 'unknown' };
    }
  }

  async searchTwitter(fullName, username) {
    try {
      // Try username variations first
      if (username) {
        const usernameVariations = this.generateUsernameVariations(fullName, username);
        
        for (const variation of usernameVariations) {
          const profileUrl = `https://x.com/${variation}`;
          
          try {
            await this.page.goto(profileUrl, {
              waitUntil: 'networkidle2',
              timeout: 8000
            });

            // Check if profile exists
            const isNotFound = await this.page.$('[data-testid="error-detail"]') ||
                              await this.page.$('.ErrorPage') ||
                              await this.page.title().then(title => title.includes('not found'));

            if (!isNotFound) {
              const profileInfo = await this.extractTwitterProfile(variation);
              
              if (profileInfo) {
                return {
                  found: true,
                  profiles: [profileInfo],
                  confidence: this.calculateNameMatch(profileInfo.displayName || variation, fullName),
                  searchMethod: 'username_variation'
                };
              }
            }
          } catch (navigateError) {
            console.log(`Twitter username ${variation} not found:`, navigateError.message);
            continue;
          }
        }
      }

      return { found: false, confidence: 'low', searchMethod: 'username_variation' };

    } catch (error) {
      console.error('Twitter search error:', error.message);
      return { found: false, error: error.message, confidence: 'unknown' };
    }
  }

  generateUsernameVariations(fullName, baseUsername) {
    const variations = new Set();
    
    if (baseUsername) {
      variations.add(baseUsername.toLowerCase());
      variations.add(baseUsername.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
    
    if (fullName) {
      const nameParts = fullName.toLowerCase().split(' ').filter(part => part.length > 0);
      
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        
        // Common username patterns
        variations.add(`${firstName}${lastName}`);
        variations.add(`${firstName}.${lastName}`);
        variations.add(`${firstName}_${lastName}`);
        variations.add(`${firstName}${lastName[0]}`);
        variations.add(`${firstName[0]}${lastName}`);
        variations.add(`${lastName}${firstName}`);
        variations.add(`${lastName}.${firstName}`);
        variations.add(`${lastName}_${firstName}`);
      }
      
      // Add individual name parts
      nameParts.forEach(part => {
        if (part.length > 2) {
          variations.add(part);
        }
      });
    }
    
    return Array.from(variations).slice(0, 10); // Limit to prevent abuse
  }

  async extractInstagramProfile(username) {
    try {
      // Extract basic profile information from Instagram
      const displayName = await this.page.$eval('h2', el => el.textContent.trim()).catch(() => username);
      const bio = await this.page.$eval('div.-vDIg span', el => el.textContent.trim()).catch(() => '');
      const followers = await this.page.$eval('a[href*="/followers/"] .g47SY', el => el.textContent.trim()).catch(() => '0');
      
      return {
        username,
        displayName,
        bio,
        followers,
        url: `https://www.instagram.com/${username}/`,
        platform: 'instagram'
      };
    } catch (error) {
      return null;
    }
  }

  async extractTwitterProfile(username) {
    try {
      // Extract basic profile information from Twitter/X
      const displayName = await this.page.$eval('[data-testid="UserName"] span', el => el.textContent.trim()).catch(() => username);
      const bio = await this.page.$eval('[data-testid="UserDescription"]', el => el.textContent.trim()).catch(() => '');
      const followers = await this.page.$eval('[href*="/followers"] span', el => el.textContent.trim()).catch(() => '0');
      
      return {
        username,
        displayName,
        bio,
        followers,
        url: `https://x.com/${username}`,
        platform: 'twitter'
      };
    } catch (error) {
      return null;
    }
  }

  async extractLinkedInProfiles(profileElements, fullName) {
    const profiles = [];
    
    for (let i = 0; i < Math.min(profileElements.length, 3); i++) {
      try {
        const element = profileElements[i];
        const name = await element.$eval('.name, .profile-name, h3', el => el.textContent.trim()).catch(() => '');
        const title = await element.$eval('.title, .headline', el => el.textContent.trim()).catch(() => '');
        const location = await element.$eval('.location', el => el.textContent.trim()).catch(() => '');
        const url = await element.$eval('a', el => el.href).catch(() => '');
        
        if (name) {
          profiles.push({
            name,
            title,
            location,
            url,
            platform: 'linkedin',
            confidence: this.calculateNameMatch(name, fullName)
          });
        }
      } catch (error) {
        console.log('Error extracting LinkedIn profile:', error.message);
      }
    }
    
    return profiles;
  }

  async extractFacebookProfiles(profileElements, fullName) {
    const profiles = [];
    
    for (let i = 0; i < Math.min(profileElements.length, 3); i++) {
      try {
        const element = profileElements[i];
        const name = await element.$eval('.name, .profile-link', el => el.textContent.trim()).catch(() => '');
        const url = await element.$eval('a', el => el.href).catch(() => '');
        
        if (name) {
          profiles.push({
            name,
            url,
            platform: 'facebook',
            confidence: this.calculateNameMatch(name, fullName)
          });
        }
      } catch (error) {
        console.log('Error extracting Facebook profile:', error.message);
      }
    }
    
    return profiles;
  }

  async extractYouTubeChannels(channelElements, fullName) {
    const channels = [];
    
    for (let i = 0; i < Math.min(channelElements.length, 3); i++) {
      try {
        const element = channelElements[i];
        const name = await element.$eval('#text, .channel-name', el => el.textContent.trim()).catch(() => '');
        const subscribers = await element.$eval('#subscribers, .subscriber-count', el => el.textContent.trim()).catch(() => '');
        const url = await element.$eval('a', el => el.href).catch(() => '');
        
        if (name) {
          channels.push({
            name,
            subscribers,
            url,
            platform: 'youtube',
            confidence: this.calculateNameMatch(name, fullName)
          });
        }
      } catch (error) {
        console.log('Error extracting YouTube channel:', error.message);
      }
    }
    
    return channels;
  }

  calculateNameMatch(foundName, searchName) {
    if (!foundName || !searchName) return 'low';
    
    const found = foundName.toLowerCase().trim();
    const search = searchName.toLowerCase().trim();
    
    if (found === search) return 'high';
    
    const foundParts = found.split(' ').filter(p => p.length > 0);
    const searchParts = search.split(' ').filter(p => p.length > 0);
    
    let matches = 0;
    searchParts.forEach(searchPart => {
      if (foundParts.some(foundPart => foundPart.includes(searchPart) || searchPart.includes(foundPart))) {
        matches++;
      }
    });
    
    const matchRatio = matches / searchParts.length;
    
    if (matchRatio >= 0.8) return 'high';
    if (matchRatio >= 0.5) return 'medium';
    return 'low';
  }

  calculateProfileConfidence(profiles, fullName) {
    if (!profiles || profiles.length === 0) return 'low';
    
    const confidences = profiles.map(profile => 
      this.calculateNameMatch(profile.name || profile.displayName, fullName)
    );
    
    if (confidences.includes('high')) return 'high';
    if (confidences.includes('medium')) return 'medium';
    return 'low';
  }

  calculateConfidence(discoveryResults) {
    const { totalFound, totalSearched } = discoveryResults.summary;
    
    if (totalFound === 0) return 'low';
    
    const foundRatio = totalFound / totalSearched;
    const platformConfidences = Object.values(discoveryResults.platforms)
      .filter(p => p.found)
      .map(p => p.confidence);
    
    const hasHighConfidence = platformConfidences.includes('high');
    const hasMediumConfidence = platformConfidences.includes('medium');
    
    if (foundRatio >= 0.6 && hasHighConfidence) return 'high';
    if (foundRatio >= 0.4 && (hasHighConfidence || hasMediumConfidence)) return 'medium';
    if (foundRatio >= 0.2) return 'low';
    
    return 'very_low';
  }

  formatNameForLinkedIn(fullName) {
    return fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  maskEmail(email) {
    const [user, domain] = email.split('@');
    const maskedUser = user.length > 2 ? 
      user[0] + '*'.repeat(user.length - 2) + user[user.length - 1] : 
      user;
    return `${maskedUser}@${domain}`;
  }

  getDemoResults(searchData) {
    const { fullName, email, username, location } = searchData;
    
    return {
      searchCriteria: {
        fullName,
        email: email ? this.maskEmail(email) : null,
        username,
        location
      },
      platforms: {
        linkedin: {
          found: true,
          profiles: [{
            name: fullName,
            title: 'Software Engineer at Tech Company',
            location: location || 'San Francisco, CA',
            url: 'https://www.linkedin.com/in/demo-profile',
            platform: 'linkedin',
            confidence: 'high'
          }],
          confidence: 'high',
          searchMethod: 'demo_data'
        },
        instagram: {
          found: true,
          profiles: [{
            username: username || fullName.toLowerCase().replace(' ', ''),
            displayName: fullName,
            bio: 'Living life to the fullest 🌟',
            followers: '1.2K',
            url: `https://www.instagram.com/${username || fullName.toLowerCase().replace(' ', '')}/`,
            platform: 'instagram',
            confidence: 'medium'
          }],
          confidence: 'medium',
          searchMethod: 'demo_data'
        },
        facebook: {
          found: false,
          confidence: 'low',
          searchMethod: 'demo_data'
        },
        youtube: {
          found: true,
          profiles: [{
            name: `${fullName}'s Channel`,
            subscribers: '234 subscribers',
            url: 'https://www.youtube.com/c/demo-channel',
            platform: 'youtube',
            confidence: 'medium'
          }],
          confidence: 'medium',
          searchMethod: 'demo_data'
        },
        twitter: {
          found: false,
          confidence: 'low',
          searchMethod: 'demo_data'
        }
      },
      summary: {
        totalFound: 3,
        totalSearched: 5,
        confidence: 'high'
      },
      timestamp: new Date().toISOString()
    };
  }
}

export default AccountDiscoveryService;