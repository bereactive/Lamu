<?php defined('SYSPATH') OR die('No direct script access.');

/**
 * Email Data Provider
 *
 * @author     Ushahidi Team <team@ushahidi.com>
 * @package    DataProvider\Email
 * @copyright  2013 Ushahidi
 * @license    http://www.gnu.org/copyleft/gpl.html GNU General Public License Version 3 (GPLv3)
 */

// Plugin Info
$plugin = array(
	'name' => 'Email',
	'version' => '0.1',

	// Services Provided By This Plugin
	'services' => array(
		Message_Type::SMS => FALSE,
		Message_Type::IVR => FALSE,
		Message_Type::EMAIL => TRUE,
		Message_Type::TWITTER => FALSE
	),

	// Option Key and Label
	'options' => array(
		'incoming_type' => array(
			'label' => 'Incoming Server Type',
			'input' => 'radio',
			'description' => '',
			'options' => array('POP', 'IMAP')
		),
		'incoming_server' => array(
			'label' => 'Incoming Server',
			'input' => 'text',
			'description' => ''
		),
		'incoming_port' => array(
			'label' => 'Incoming Server Port',
			'input' => 'text',
			'description' => ''
		),
		'incoming_security' => array(
			'label' => 'Incoming Server Security (SSL, TLS, None)',
			'input' => 'text',
			'description' => ''
		),
		'incoming_username' => array(
			'label' => 'Incoming Username',
			'input' => 'text',
			'description' => ''
		),
		'incoming_password' => array(
			'label' => 'Incoming Password',
			'input' => 'text',
			'description' => ''
		),
		'outgoing_type' => array(
			'label' => 'Outgoing Server Type',
			'input' => 'radio',
			'description' => '',
			'options' => array('SMTP', 'sendmail', 'Native')
		),
		'outgoing_server' => array(
			'label' => 'Outgoing Server',
			'input' => 'text',
			'description' => ''
		),
		'outgoing_port' => array(
			'label' => 'Outgoing Server Port',
			'input' => 'text',
			'description' => ''
		),
		'outgoing_security' => array(
			'label' => 'Outgoing Server Security (SSL, TLS, None)',
			'input' => 'radio',
			'description' => '',
			'options' => array('None', 'SSL', 'TLS')
		),
		'outgoing_username' => array(
			'label' => 'Outgoing Username',
			'input' => 'text',
			'description' => ''
		),
		'outgoing_password' => array(
			'label' => 'Outgoing Password',
			'input' => 'text',
			'description' => ''
		),
		'from_name' => array(
			'label' => 'Email Sender Name',
			'input' => 'text',
			'description' => ''
		),
	),

	// Links
	'links' => array(
	)
);

// Register the plugin
DataProvider::register_provider('email', $plugin);

