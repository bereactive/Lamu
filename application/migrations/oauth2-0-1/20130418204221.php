<?php defined('SYSPATH') OR die('No direct script access.');

/**
 * Initial schema setup for oauth module
 */

class Migration_Oauth2_0_1_20130418204221 extends Minion_Migration_Base {

	/**
	 * Run queries needed to apply this migration
	 *
	 * @param Kohana_Database $db Database connection
	 */
	public function up(Kohana_Database $db)
	{
		// noop, D120
	}

	/**
	 * Run queries needed to remove this migration
	 *
	 * @param Kohana_Database $db Database connection
	 */
	public function down(Kohana_Database $db)
	{
		// noop, D120
	}

}
